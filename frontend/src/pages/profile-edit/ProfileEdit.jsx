import './ProfileEdit.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import Toast from '../../components/toast/Toast';

const ProfileEdit = () => {
    const { user } = useAuthContext();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        phone: '',
        skills: [],
        github: '',
        portfolio: '',
        projects: []
    });

    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toasts, setToasts] = useState([]);
    const [errors, setErrors] = useState({
        nickname: '',
        email: '',
        phone: '',
        github: '',
        portfolio: '',
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

    // Validazione email
    const validateEmail = (email) => {
        if (!email) return '';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) ? '' : 'Email non valida';
    };

    // Validazione telefono
    const validatePhone = (phone) => {
        if (!phone) return '';
        const phoneRegex = /^[\d\s+()-]{8,20}$/;
        return phoneRegex.test(phone) ? '' : 'Numero di telefono non valido';
    };

    // Validazione URL
    const validateURL = (url) => {
        if (!url) return '';
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://') ? '' : 'L\'URL deve iniziare con http:// o https://';
        } catch {
            return 'URL non valido';
        }
    };

    // Validazione nickname
    const validateNickname = (nickname) => {
        if (!nickname || !nickname.trim()) return 'Il nickname è obbligatorio';
        if (nickname.trim().length < 2) return 'Il nickname deve avere almeno 2 caratteri';
        if (nickname.trim().length > 50) return 'Il nickname non può superare 50 caratteri';
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
                        email: data.email || '',
                        phone: data.phone || '',
                        skills: data.skills || [],
                        github: data.github || '',
                        portfolio: data.portfolio || '',
                        projects: data.projects || []
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

        // Validazione real-time
        let error = '';
        switch (name) {
            case 'nickname':
                error = validateNickname(value);
                break;
            case 'email':
                error = validateEmail(value);
                break;
            case 'phone':
                error = validatePhone(value);
                break;
            case 'github':
            case 'portfolio':
                error = validateURL(value);
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
            projects: [...prev.projects, { title: '', description: '', imageIds: [] }]
        }));
    };

    const handleProjectChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.map((project, i) =>
                i === index ? { ...project, [field]: value } : project
            )
        }));

        // Validazione progetti
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

    const validateForm = () => {
        const newErrors = {
            nickname: validateNickname(formData.nickname),
            email: validateEmail(formData.email),
            phone: validatePhone(formData.phone),
            github: validateURL(formData.github),
            portfolio: validateURL(formData.portfolio),
            skills: '',
            projects: {}
        };

        // Validazione skills per freelancer
        if (user.role === 'FREELANCER' && formData.skills.length === 0) {
            newErrors.skills = 'Inserisci almeno una competenza';
        }

        // Validazione progetti
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

        setErrors(newErrors);

        // Controlla se ci sono errori
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
            // Filtra progetti vuoti
            const projectsToSend = formData.projects.filter(p =>
                p.title?.trim() && p.description?.trim()
            );

            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    ...formData,
                    projects: projectsToSend
                })
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

                        <div className="form-group">
                            <label htmlFor="phone">Telefono</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className={errors.phone ? 'input-error' : ''}
                                placeholder="+39 123 456 7890"
                                disabled={saving}
                            />
                            {errors.phone && (
                                <span className="error-message">{errors.phone}</span>
                            )}
                        </div>
                    </div>

                    {/* Sezione Freelancer */}
                    {user.role === 'FREELANCER' && (
                        <>
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
                            </div>

                            {/* Progetti */}
                            <div className="form-section">
                                <h2>Progetti Portfolio {formData.projects.length > 0 && <span className="projects-count">({formData.projects.length}/10)</span>}</h2>

                                {formData.projects.map((project, index) => (
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
                                    </div>
                                ))}

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