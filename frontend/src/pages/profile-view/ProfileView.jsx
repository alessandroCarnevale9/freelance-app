import './ProfileView.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';

const ProfileView = () => {
    const { address } = useParams(); // Address del profilo da visualizzare
    const { user } = useAuthContext(); // Utente loggato
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isOwnProfile = !address || (user && address?.toLowerCase() === user.address?.toLowerCase());

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const targetAddress = address || user?.address;

                if (!targetAddress) {
                    setError('Nessun profilo specificato');
                    return;
                }

                const response = await fetch(`/api/users/profile/${targetAddress}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Profilo non trovato');
                }

                const data = await response.json();
                setProfile(data);
            } catch (err) {
                console.error('Errore caricamento profilo:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [address, user]);

    if (loading) {
        return (
            <div className="profile-view">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Caricamento profilo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-view">
                <div className="error-container">
                    <p>{error}</p>
                    <button onClick={() => navigate(-1)}>Torna indietro</button>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <div className="profile-view">
            <div className="profile-container">
                {/* Header con info base */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        {profile.nickname?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    <div className="profile-basic-info">
                        <h1>{profile.nickname}</h1>
                        <p className="profile-role">{profile.role}</p>
                        <p className="profile-address">
                            {profile.address.slice(0, 6)}...{profile.address.slice(-4)}
                        </p>
                    </div>

                    {isOwnProfile && (
                        <button
                            className="edit-profile-btn"
                            onClick={() => navigate('/profile/edit')}
                        >
                            Modifica Profilo
                        </button>
                    )}
                </div>

                {/* Contenuto specifico per ruolo */}
                {profile.role === 'FREELANCER' && (
                    <FreelancerProfileContent profile={profile} />
                )}

                {profile.role === 'CLIENT' && (
                    <ClientProfileContent profile={profile} />
                )}
            </div>
        </div>
    );
};

// Componente per il contenuto del profilo Freelancer
const FreelancerProfileContent = ({ profile }) => {
    return (
        <>
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
                <div className="profile-section">
                    <h2>Competenze</h2>
                    <div className="skills-container">
                        {profile.skills.map((skill, index) => (
                            <span key={index} className="skill-tag">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Progetti Portfolio */}
            {profile.projects && profile.projects.length > 0 && (
                <div className="profile-section">
                    <h2>Portfolio</h2>
                    <div className="projects-grid">
                        {profile.projects.map((project, index) => (
                            <div key={index} className="project-card">
                                {project.imageIds && project.imageIds.length > 0 && (
                                    <div className="project-images">
                                        {project.imageIds.map((imageId, imgIndex) => (
                                            <img
                                                key={imgIndex}
                                                src={`/api/files/${imageId}`}
                                                alt={`${project.title} - ${imgIndex + 1}`}
                                                className="project-image"
                                            />
                                        ))}
                                    </div>
                                )}
                                <h3>{project.title}</h3>
                                <p>{project.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Contatti e Link (visibili solo se sono presenti) */}
            {(profile.email || profile.phone || profile.github || profile.portfolio) && (
                <div className="profile-section">
                    <h2>Contatti</h2>
                    <div className="contacts-container">
                        {profile.email && (
                            <div className="contact-item">
                                <span className="contact-label">Email:</span>
                                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                            </div>
                        )}
                        {profile.phone && (
                            <div className="contact-item">
                                <span className="contact-label">Telefono:</span>
                                <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                            </div>
                        )}
                        {profile.github && (
                            <div className="contact-item">
                                <span className="contact-label">GitHub:</span>
                                <a href={profile.github} target="_blank" rel="noopener noreferrer">
                                    {profile.github}
                                </a>
                            </div>
                        )}
                        {profile.portfolio && (
                            <div className="contact-item">
                                <span className="contact-label">Portfolio:</span>
                                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer">
                                    {profile.portfolio}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

// Componente per il contenuto del profilo Cliente
const ClientProfileContent = ({ profile }) => {
    return (
        <>
            {/* Statistiche base cliente */}
            <div className="profile-section">
                <h2>Informazioni</h2>
                <div className="client-stats">
                    <div className="stat-item">
                        <span className="stat-label">Progetti pubblicati</span>
                        <span className="stat-value">{profile.publishedJobs || 0}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">Progetti completati</span>
                        <span className="stat-value">{profile.completedJobs || 0}</span>
                    </div>
                </div>
            </div>

            {/* Contatti */}
            {(profile.email || profile.phone) && (
                <div className="profile-section">
                    <h2>Contatti</h2>
                    <div className="contacts-container">
                        {profile.email && (
                            <div className="contact-item">
                                <span className="contact-label">Email:</span>
                                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                            </div>
                        )}
                        {profile.phone && (
                            <div className="contact-item">
                                <span className="contact-label">Telefono:</span>
                                <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileView;