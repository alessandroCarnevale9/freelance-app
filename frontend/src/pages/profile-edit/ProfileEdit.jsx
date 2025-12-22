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

    const addToast = (message, type = 'error') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
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
    };

    const handleAddSkill = () => {
        if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }));
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const handleAddProject = () => {
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
    };

    const handleRemoveProject = (index) => {
        setFormData(prev => ({
            ...prev,
            projects: prev.projects.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validazione base
        if (!formData.nickname.trim()) {
            addToast('Il nickname è obbligatorio', 'error');
            return;
        }

        if (user.role === 'FREELANCER' && formData.skills.length === 0) {
            addToast('Inserisci almeno una competenza', 'error');
            return;
        }

        setSaving(true);

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(formData)
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
                    <button
                        className="back-btn"
                        onClick={() => navigate(`/profile/${user.address}`)}
                        disabled={saving}
                    >
                        Annulla
                    </button>
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
                                required
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Telefono</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Sezione Freelancer */}
                    {user.role === 'FREELANCER' && (
                        <>
                            {/* Skills */}
                            <div className="form-section">
                                <h2>Competenze *</h2>

                                <div className="skills-input-container">
                                    <input
                                        type="text"
                                        placeholder="Aggiungi una competenza..."
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddSkill();
                                            }
                                        }}
                                        disabled={saving}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSkill}
                                        disabled={saving}
                                        className="add-skill-btn"
                                    >
                                        Aggiungi
                                    </button>
                                </div>

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
                                        disabled={saving}
                                    />
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
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            {/* Progetti */}
                            <div className="form-section">
                                <h2>Progetti Portfolio</h2>

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
                                                disabled={saving}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Descrizione</label>
                                            <textarea
                                                value={project.description}
                                                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                                                rows="4"
                                                disabled={saving}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={handleAddProject}
                                    disabled={saving}
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