import './ProfileEdit.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import Toast from '../../components/toast/Toast';
import { AddImage } from '@icons';

const ProfileEdit = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nickname: '',
        description: '',
        email: '',
        skills: [],
        github: '',
        portfolio: '',
        discord: '',
        slack: '',
        projects: []
    });

    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [errors, setErrors] = useState({
        nickname: '',
        description: '',
        email: '',
        github: '',
        portfolio: '',
        discord: '',
        slack: '',
        skills: '',
        projects: {}
    });

    const addToast = (message, type = 'error') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    // Validazioni
    const validateEmail = (email) => {
        if (!email) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Email non valida';
    };

    const validateURL = (url) => {
        if (!url) return '';
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://') ? '' : 'L\'URL deve iniziare con http:// o https://';
        } catch {
            return 'URL non valido';
        }
    };

    const validateDiscordSlack = (value) => {
        if (!value) return '';
        if (value.startsWith('http://') || value.startsWith('https://')) {
            return validateURL(value);
        }
        if (value.trim().length < 2) return 'Deve avere almeno 2 caratteri';
        if (value.trim().length > 100) return 'Non può superare 100 caratteri';
        return '';
    };

    const validateNickname = (nickname) => {
        if (!nickname || !nickname.trim()) return 'Il nickname è obbligatorio';
        if (nickname.trim().length < 2) return 'Il nickname deve avere almeno 2 caratteri';
        if (nickname.trim().length > 50) return 'Il nickname non può superare 50 caratteri';
        return '';
    };

    const validateDescription = (description) => {
        if (!description) return '';
        if (description.trim().length < 10) return 'La descrizione deve avere almeno 10 caratteri';
        if (description.trim().length > 500) return 'La descrizione non può superare 500 caratteri';
        return '';
    };

    // Carica i dati del profilo esistente
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await fetch(`/api/users/profile/${user.address}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setFormData({
                        nickname: data.nickname || '',
                        description: data.description || '',
                        email: data.email || '',
                        skills: data.skills || [],
                        github: data.github || '',
                        portfolio: data.portfolio || '',
                        discord: data.discord || '',
                        slack: data.slack || '',
                        projects: (data.projects || []).map(p => ({
                            ...p,
                            existingImageIds: p.imageIds || [],
                            newImages: [],
                            newPreviews: [],
                            imagesToDelete: []
                        }))
                    });
                }
            } catch (err) {
                console.error('Errore caricamento profilo:', err);
                addToast('Errore nel caricamento del profilo', 'error');
            } finally {
                setLoading(false);
            }
        };

        if (user?.address) {
            fetchProfile();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        let error = '';
        switch (name) {
            case 'nickname':
                error = validateNickname(value);
                break;
            case 'description':
                error = validateDescription(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'github':
            case 'portfolio':
                error = validateURL(value);
                break;
            case 'discord':
            case 'slack':
                error = validateDiscordSlack(value);
                break;
            default:
                break;
        }

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim();

        if (!trimmedSkill) {
            setErrors(prev => ({ ...prev, skills: 'Inserisci una competenza' }));
            return;
        }

        if (trimmedSkill.length < 2) {
            setErrors(prev => ({ ...prev, skills: 'La competenza deve avere almeno 2 caratteri' }));
            return;
        }

        if (formData.skills.includes(trimmedSkill)) {
            setErrors(prev => ({ ...prev, skills: 'Questa competenza è già presente' }));
            return;
        }

        if (formData.skills.length >= 20) {
            setErrors(prev => ({ ...prev, skills: 'Puoi aggiungere massimo 20 competenze' }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, trimmedSkill]
        }));
        setNewSkill('');
        setErrors(prev => ({ ...prev, skills: '' }));
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
        setErrors(prev => ({ ...prev, skills: '' }));
    };

    const handleAddProject = () => {
        if (formData.projects.length >= 10) {
            addToast('Puoi aggiungere massimo 10 progetti', 'error');
            return;
        }

        setFormData(prev => ({
            ...prev,
            projects: [...prev.projects, {
                title: '',
                description: '',
                existingImageIds: [],
                newImages: [],
                newPreviews: [],
                imagesToDelete: []
            }]
        }));
    };

    const handleProjectChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((project, i) =>
                i === index ? { ...project, [field]: value } : project
            )
        }));

        let error = '';
        if (field === 'title' && value && value.trim().length < 3) {
            error = 'Il titolo deve avere almeno 3 caratteri';
        }
        if (field === 'description' && value && value.trim().length < 10) {
            error = 'La descrizione deve avere almeno 10 caratteri';
        }

        setErrors(prev => ({
            ...prev,
            projects: {
                ...prev.projects,
                [`${index}-${field}`]: error
            }
        }));
    };

    const handleRemoveProject = (index) => {
        const project = formData.projects[index];

        // Revoca gli URL delle preview delle nuove immagini
        if (project.newPreviews) {
            project.newPreviews.forEach(url => URL.revokeObjectURL(url));
        }

        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));

        setErrors(prev => {
            const newProjectErrors = { ...prev.projects };
            Object.keys(newProjectErrors).forEach(key => {
                if (key.startsWith(`${index}-`)) {
                    delete newProjectErrors[key];
                }
            });
            return {
                ...prev,
                projects: newProjectErrors
            };
        });
    };

    // Gestione immagini - VERSIONE CORRETTA
    const handleProjectImageAdd = (projectIndex, e) => {
        const files = e.target.files;

        // Reset subito dell'input per permettere la selezione dello stesso file
        e.target.value = '';

        if (!files || files.length === 0) {
            console.log('Nessun file selezionato');
            return;
        }

        const selectedFiles = Array.from(files);
        console.log('File selezionati:', selectedFiles.length);

        const project = formData.projects[projectIndex];
        if (!project) {
            console.error('Progetto non trovato:', projectIndex);
            return;
        }

        const currentTotal = (project.existingImageIds?.length || 0) + (project.newImages?.length || 0);
        console.log('Immagini attuali:', currentTotal, 'Nuove:', selectedFiles.length);

        // Validazioni
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = selectedFiles.filter(f => f.size > maxSize);
        if (invalidFiles.length > 0) {
            addToast(`Alcuni file superano i 5MB: ${invalidFiles.map(f => f.name).join(', ')}`, 'error');
            return;
        }

        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidTypes = selectedFiles.filter(f => !validTypes.includes(f.type));
        if (invalidTypes.length > 0) {
            addToast('Tipo di file non supportato. Usa: JPEG, PNG, GIF, WEBP', 'error');
            console.log('Tipi non validi:', invalidTypes.map(f => f.type));
            return;
        }

        if (currentTotal + selectedFiles.length > 5) {
            addToast(`Puoi aggiungere massimo 5 immagini per progetto (attuali: ${currentTotal})`, 'error');
            return;
        }

        // Crea preview
        const newPreviews = selectedFiles.map(f => {
            const url = URL.createObjectURL(f);
            console.log('Preview creata:', url);
            return url;
        });

        setFormData(prev => {
            const updatedProjects = prev.projects.map((p, i) => {
                if (i !== projectIndex) return p;

                return {
                    ...p,
                    newImages: [...(p.newImages || []), ...selectedFiles],
                    newPreviews: [...(p.newPreviews || []), ...newPreviews]
                };
            });

            console.log('Stato aggiornato per progetto', projectIndex, {
                newImagesCount: updatedProjects[projectIndex].newImages.length,
                newPreviewsCount: updatedProjects[projectIndex].newPreviews.length
            });

            return {
                ...prev,
                projects: updatedProjects
            };
        });
    };

    const handleRemoveExistingImage = (projectIndex, imageId) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((p, i) =>
                i === projectIndex
                    ? {
                        ...p,
                        existingImageIds: p.existingImageIds.filter(id => id !== imageId),
                        imagesToDelete: [...(p.imagesToDelete || []), imageId]
                    }
                    : p
            )
        }));
    };

    const handleRemoveNewImage = (projectIndex, imageIndex) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((p, i) => {
                if (i !== projectIndex) return p;

                const urlToRevoke = p.newPreviews[imageIndex];
                if (urlToRevoke) {
                    URL.revokeObjectURL(urlToRevoke);
                }

                return {
                    ...p,
                    newImages: p.newImages.filter((_, idx) => idx !== imageIndex),
                    newPreviews: p.newPreviews.filter((_, idx) => idx !== imageIndex)
                };
            })
        }));
    };

    const validateForm = () => {
        const newErrors = {
            nickname: validateNickname(formData.nickname),
            description: '',
            email: '',
            github: '',
            portfolio: '',
            discord: '',
            slack: '',
            skills: '',
            projects: {}
        };

        if (user.role === 'FREELANCER') {
            newErrors.description = validateDescription(formData.description);
            newErrors.email = validateEmail(formData.email);
            newErrors.github = validateURL(formData.github);
            newErrors.portfolio = validateURL(formData.portfolio);
            newErrors.discord = validateDiscordSlack(formData.discord);
            newErrors.slack = validateDiscordSlack(formData.slack);

            if (formData.skills.length === 0) {
                newErrors.skills = 'Inserisci almeno una competenza';
            }

            formData.projects.forEach((project, index) => {
                if (project.title && project.title.trim().length < 3) {
                    newErrors.projects[`${index}-title`] = 'Il titolo deve avere almeno 3 caratteri';
                }
                if (project.description && project.description.trim().length < 10) {
                    newErrors.projects[`${index}-description`] = 'La descrizione deve avere almeno 10 caratteri';
                }
                if (project.title && !project.description) {
                    newErrors.projects[`${index}-description`] = 'La descrizione è obbligatoria se hai inserito un titolo';
                }
                if (!project.title && project.description) {
                    newErrors.projects[`${index}-title`] = 'Il titolo è obbligatorio se hai inserito una descrizione';
                }
            });
        }

        setErrors(newErrors);

        const hasErrors = Object.values(newErrors).some(error => {
            if (typeof error === 'string') return error !== '';
            if (typeof error === 'object') return Object.keys(error).length > 0;
            return false;
        });

        return !hasErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            addToast('Correggi gli errori nel form prima di salvare', 'error');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);

        try {
            const token = localStorage.getItem('accessToken');

            // 1. Elimina le immagini marcate per la cancellazione
            for (const project of formData.projects) {
                if (project.imagesToDelete && project.imagesToDelete.length > 0) {
                    for (const imageId of project.imagesToDelete) {
                        try {
                            await fetch(`/api/files/${imageId}`, {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                        } catch (err) {
                            console.error('Errore eliminazione immagine:', err);
                        }
                    }
                }
            }

            // 2. Carica le nuove immagini
            const updatedProjects = [];

            for (let i = 0; i < formData.projects.length; i++) {
                const project = formData.projects[i];

                if (!project.title?.trim() || !project.description?.trim()) {
                    continue; // Salta progetti vuoti
                }

                let newImageIds = [];

                if (project.newImages && project.newImages.length > 0) {
                    const formDataUpload = new FormData();

                    // Il backend si aspetta il campo 'files' (vedere upload.array('files', 10))
                    project.newImages.forEach((file) => {
                        formDataUpload.append('files', file);
                    });

                    try {
                        const uploadResponse = await fetch('/api/users/upload-images', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formDataUpload
                        });

                        if (uploadResponse.ok) {
                            const uploadData = await uploadResponse.json();
                            newImageIds = uploadData.imageIds || [];
                        }
                    } catch (err) {
                        console.error('Errore upload immagini:', err);
                    }
                }

                updatedProjects.push({
                    title: project.title.trim(),
                    description: project.description.trim(),
                    imageIds: [...(project.existingImageIds || []), ...newImageIds]
                });
            }

            // 3. Aggiorna il profilo
            let dataToSend = { nickname: formData.nickname };

            if (user.role === 'FREELANCER') {
                dataToSend = {
                    ...formData,
                    projects: updatedProjects
                };
            }

            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Errore nel salvataggio');
            }

            addToast('Profilo aggiornato con successo!', 'success');

            setTimeout(() => {
                navigate(`/profile/${user.address}`);
            }, 1000);
        } catch (err) {
            console.error('Errore salvataggio profilo:', err);
            addToast(err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    // Cleanup delle preview quando il componente si smonta
    useEffect(() => {
        return () => {
            formData.projects.forEach(p => {
                if (p.newPreviews) {
                    p.newPreviews.forEach(url => URL.revokeObjectURL(url));
                }
            });
        };
    }, []);

    if (loading) {
        return (
            <div className="profile-edit">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Caricamento...</p>
                </div>
            </div>
        );
    }

    const triggerFileInput = (index) => {
        const input = document.getElementById(`file-input-${index}`);
        if (input) {
            console.log('Triggering file input per progetto', index);
            input.click();
        } else {
            console.error('Input file non trovato per progetto', index);
        }
    };

    return (
        <div className="profile-edit">
            <div className="profile-edit-container">
                <div className="profile-edit-header">
                    <h1>Modifica Profilo</h1>
                </div>

                <form onSubmit={handleSubmit} className="profile-edit-form">
                    {/* Informazioni Base */}
                    <div className="form-section">
                        <h2>Informazioni Base</h2>

                        <div className="form-group">
                            <label htmlFor="nickname">Nickname *</label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                value={formData.nickname}
                                onChange={handleInputChange}
                                className={errors.nickname ? 'input-error' : ''}
                                required
                                disabled={saving}
                            />
                            {errors.nickname && (
                                <span className="error-message">{errors.nickname}</span>
                            )}
                        </div>
                    </div>

                    {/* Sezione Freelancer */}
                    {user.role === 'FREELANCER' && (
                        <>
                            {/* Descrizione */}
                            <div className="form-section">
                                <h2>Descrizione</h2>

                                <div className="form-group">
                                    <label htmlFor="description">Parlaci di te</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className={errors.description ? 'input-error' : ''}
                                        rows="4"
                                        placeholder="Descrivi la tua esperienza, le tue passioni e cosa ti rende unico..."
                                        disabled={saving}
                                    />
                                    {errors.description && (
                                        <span className="error-message">{errors.description}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={errors.email ? 'input-error' : ''}
                                        disabled={saving}
                                    />
                                    {errors.email && (
                                        <span className="error-message">{errors.email}</span>
                                    )}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="form-section">
                                <h2>Competenze * {formData.skills.length > 0 && <span className="skills-count">({formData.skills.length}/20)</span>}</h2>

                                <div className="skills-input-container">
                                    <input
                                        type="text"
                                        placeholder="Aggiungi una competenza..."
                                        value={newSkill}
                                        onChange={(e) => {
                                            setNewSkill(e.target.value);
                                            setErrors(prev => ({ ...prev, skills: '' }));
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSkill();
                                            }
                                        }}
                                        className={errors.skills ? 'input-error' : ''}
                                        disabled={saving}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        disabled={saving || formData.skills.length >= 20}
                                        className="add-skill-btn"
                                    >
                                        Aggiungi
                                    </button>
                                </div>
                                {errors.skills && (
                                    <span className="error-message">{errors.skills}</span>
                                )}

                                <div className="skills-list">
                                    {formData.skills.map((skill, index) => (
                                        <div key={index} className="skill-item">
                                            <span>{skill}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                disabled={saving}
                                                className="remove-skill-btn"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Link esterni */}
                            <div className="form-section">
                                <h2>Link</h2>

                                <div className="form-group">
                                    <label htmlFor="github">GitHub</label>
                                    <input
                                        type="url"
                                        id="github"
                                        name="github"
                                        placeholder="https://github.com/username"
                                        value={formData.github}
                                        onChange={handleInputChange}
                                        className={errors.github ? 'input-error' : ''}
                                        disabled={saving}
                                    />
                                    {errors.github && (
                                        <span className="error-message">{errors.github}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="portfolio">Portfolio</label>
                                    <input
                                        type="url"
                                        id="portfolio"
                                        name="portfolio"
                                        placeholder="https://portfolio.com"
                                        value={formData.portfolio}
                                        onChange={handleInputChange}
                                        className={errors.portfolio ? 'input-error' : ''}
                                        disabled={saving}
                                    />
                                    {errors.portfolio && (
                                        <span className="error-message">{errors.portfolio}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="discord">Discord</label>
                                    <input
                                        type="text"
                                        id="discord"
                                        name="discord"
                                        placeholder="@username o https://discord.com/users/..."
                                        value={formData.discord}
                                        onChange={handleInputChange}
                                        className={errors.discord ? 'input-error' : ''}
                                        disabled={saving}
                                    />
                                    {errors.discord && (
                                        <span className="error-message">{errors.discord}</span>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="slack">Slack</label>
                                    <input
                                        type="text"
                                        id="slack"
                                        name="slack"
                                        placeholder="@username o link workspace"
                                        value={formData.slack}
                                        onChange={handleInputChange}
                                        className={errors.slack ? 'input-error' : ''}
                                        disabled={saving}
                                    />
                                    {errors.slack && (
                                        <span className="error-message">{errors.slack}</span>
                                    )}
                                </div>
                            </div>

                            {/* Progetti */}
                            <div className="form-section">
                                <h2>Progetti Portfolio {formData.projects.length > 0 && <span className="projects-count">({formData.projects.length}/10)</span>}</h2>

                                {formData.projects.map((project, index) => {
                                    const totalImages = (project.existingImageIds?.length || 0) + (project.newImages?.length || 0);

                                    return (
                                        <div key={index} className="project-form-item">
                                            <div className="project-form-header">
                                                <h3>Progetto {index + 1}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveProject(index)}
                                                    disabled={saving}
                                                    className="remove-project-btn"
                                                >
                                                    Rimuovi
                                                </button>
                                            </div>

                                            <div className="form-group">
                                                <label>Titolo</label>
                                                <input
                                                    type="text"
                                                    value={project.title}
                                                    onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                                                    className={errors.projects[`${index}-title`] ? 'input-error' : ''}
                                                    disabled={saving}
                                                />
                                                {errors.projects[`${index}-title`] && (
                                                    <span className="error-message">{errors.projects[`${index}-title`]}</span>
                                                )}
                                            </div>

                                            <div className="form-group">
                                                <label>Descrizione</label>
                                                <textarea
                                                    value={project.description}
                                                    onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                                    className={errors.projects[`${index}-description`] ? 'input-error' : ''}
                                                    rows="4"
                                                    disabled={saving}
                                                />
                                                {errors.projects[`${index}-description`] && (
                                                    <span className="error-message">{errors.projects[`${index}-description`]}</span>
                                                )}
                                            </div>

                                            {/* Gestione Immagini */}
                                            <div className="form-group">
                                                <label>
                                                    Immagini {totalImages > 0 && <span className="image-count">({totalImages}/5)</span>}
                                                </label>

                                                <input
                                                    id={`file-input-${index}`}
                                                    type="file"
                                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                                    multiple
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleProjectImageAdd(index, e)}
                                                    disabled={saving}
                                                />

                                                <div className="project-images-grid">
                                                    {/* Immagini esistenti */}
                                                    {project.existingImageIds && project.existingImageIds.map((imageId, imgIndex) => (
                                                        <div key={`existing-${imgIndex}`} className="project-image-item">
                                                            <img
                                                                src={`/api/files/${imageId}`}
                                                                alt={`Progetto ${index + 1} - ${imgIndex + 1}`}
                                                                className="project-image-preview"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="remove-image-btn"
                                                                onClick={() => handleRemoveExistingImage(index, imageId)}
                                                                disabled={saving}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* Nuove immagini */}
                                                    {project.newPreviews && project.newPreviews.map((preview, imgIndex) => (
                                                        <div key={`new-${imgIndex}`} className="project-image-item">
                                                            <img
                                                                src={preview}
                                                                alt={`Nuova ${imgIndex + 1}`}
                                                                className="project-image-preview"
                                                            />
                                                            <button
                                                                type="button"
                                                                className="remove-image-btn"
                                                                onClick={() => handleRemoveNewImage(index, imgIndex)}
                                                                disabled={saving}
                                                            >
                                                                ×
                                                            </button>
                                                            <span className="new-badge">Nuova</span>
                                                        </div>
                                                    ))}

                                                    {/* Pulsante aggiungi se sotto il limite */}
                                                    {totalImages === 0 && (
                                                        <button
                                                            type="button"
                                                            className="add-image-placeholder"
                                                            onClick={() => triggerFileInput(index)}
                                                            disabled={saving}
                                                        >
                                                            <AddImage />
                                                            <span>Aggiungi immagine</span>
                                                        </button>
                                                    )}

                                                    {totalImages > 0 && totalImages < 5 && (
                                                        <button
                                                            type="button"
                                                            className="add-image-btn"
                                                            onClick={() => triggerFileInput(index)}
                                                            disabled={saving}
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <button
                                    type="button"
                                    onClick={handleAddProject}
                                    disabled={saving || formData.projects.length >= 10}
                                    className="add-project-btn"
                                >
                                    + Aggiungi Progetto
                                </button>
                            </div>
                        </>
                    )}

                    {/* Bottoni azione */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate(`/profile/${user.address}`)}
                            disabled={saving}
                            className="cancel-btn"
                        >
                            Annulla
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="save-btn"
                        >
                            {saving ? 'Salvataggio...' : 'Salva Modifiche'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProfileEdit;