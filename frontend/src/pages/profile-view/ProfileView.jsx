import './ProfileView.css';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';

const ProfileView = () => {
    const { address } = useParams();
    const { user } = useAuthContext();
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
            {/* Informazioni Base */}
            <div className="profile-section">
                <h2>Informazioni Base</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Nickname:</span>
                        <span className="info-value">{profile.nickname}</span>
                    </div>
                    {profile.email && (
                        <div className="info-item">
                            <span className="info-label">Email:</span>
                            <span className="info-value">
                                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                            </span>
                        </div>
                    )}
                </div>
            </div>

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

            {/* Link esterni */}
            {(profile.github || profile.portfolio || profile.discord || profile.slack) && (
                <div className="profile-section">
                    <h2>Link</h2>
                    <div className="links-container">
                        {profile.github && (
                            <div className="link-item">
                                <span className="link-label">GitHub:</span>
                                <a
                                    href={profile.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-value"
                                >
                                    {profile.github}
                                </a>
                            </div>
                        )}
                        {profile.portfolio && (
                            <div className="link-item">
                                <span className="link-label">Portfolio:</span>
                                <a
                                    href={profile.portfolio}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="link-value"
                                >
                                    {profile.portfolio}
                                </a>
                            </div>
                        )}
                        {profile.discord && (
                            <div className="link-item">
                                <span className="link-label">Discord:</span>
                                <span className="link-value">
                                    {profile.discord.startsWith('http') ? (
                                        <a
                                            href={profile.discord}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {profile.discord}
                                        </a>
                                    ) : (
                                        profile.discord
                                    )}
                                </span>
                            </div>
                        )}
                        {profile.slack && (
                            <div className="link-item">
                                <span className="link-label">Slack:</span>
                                <span className="link-value">
                                    {profile.slack.startsWith('http') ? (
                                        <a
                                            href={profile.slack}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {profile.slack}
                                        </a>
                                    ) : (
                                        profile.slack
                                    )}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Progetti Portfolio */}
            {profile.projects && profile.projects.length > 0 && (
                <div className="profile-section">
                    <h2>Progetti Portfolio</h2>
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
                                <div className="project-content">
                                    <h3 className="project-title">{project.title}</h3>
                                    <p className="project-description">{project.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Messaggio se il profilo è vuoto */}
            {!profile.email &&
                (!profile.skills || profile.skills.length === 0) &&
                !profile.github &&
                !profile.portfolio &&
                !profile.discord &&
                !profile.slack &&
                (!profile.projects || profile.projects.length === 0) && (
                    <div className="profile-section">
                        <div className="empty-profile-message">
                            <p>Il profilo non è ancora stato completato.</p>
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
            {/* Informazioni Base */}
            <div className="profile-section">
                <h2>Informazioni Base</h2>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">Nickname:</span>
                        <span className="info-value">{profile.nickname}</span>
                    </div>
                    {profile.email && (
                        <div className="info-item">
                            <span className="info-label">Email:</span>
                            <span className="info-value">
                                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                            </span>
                        </div>
                    )}
                    {profile.phone && (
                        <div className="info-item">
                            <span className="info-label">Telefono:</span>
                            <span className="info-value">
                                <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Messaggio se il profilo è vuoto */}
            {!profile.email && !profile.phone && (
                <div className="profile-section">
                    <div className="empty-profile-message">
                        <p>Il profilo non è ancora stato completato.</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileView;