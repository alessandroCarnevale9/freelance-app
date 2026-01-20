import "./RegistrationPage.css";
import { useState, useEffect } from "react";
import { AddImage } from "@icons";
import { ethers } from "ethers";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [discord, setDiscord] = useState("");
  const [slack, setSlack] = useState("");
  const [keyskills, setKeyskills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    email: "",
    github: "",
    portfolio: "",
    discord: "",
    slack: "",
    skills: "",
    projects: {}
  });

  const [projects, setProjects] = useState([
    { title: "", description: "", files: [], previews: [] },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Cleanup delle preview URL quando il componente si smonta
  useEffect(() => {
    return () => {
      projects.forEach((p) => {
        p.previews.forEach((url) => URL.revokeObjectURL(url));
      });
    };
  }, []);

  // Funzioni di validazione
  const validateName = (value) => {
    if (!value || !value.trim()) return "Il nickname è obbligatorio";
    if (value.trim().length < 2) return "Il nickname deve avere almeno 2 caratteri";
    if (value.trim().length > 50) return "Il nickname non può superare 50 caratteri";
    return "";
  };

  const validateDescription = (value) => {
    if (!value) return "";
    if (value.trim().length < 10) return "La descrizione deve avere almeno 10 caratteri";
    if (value.trim().length > 500) return "La descrizione non può superare 500 caratteri";
    return "";
  };

  const validateEmail = (value) => {
    if (!value) return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? "" : "Email non valida";
  };

  const validateURL = (value) => {
    if (!value) return "";
    try {
      new URL(value);
      return value.startsWith('http://') || value.startsWith('https://')
        ? ''
        : 'L\'URL deve iniziare con http:// o https://';
    } catch {
      return 'URL non valido';
    }
  };

  const validateDiscordSlack = (value) => {
    if (!value) return "";
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return validateURL(value);
    }
    if (value.trim().length < 2) return "Deve avere almeno 2 caratteri";
    if (value.trim().length > 100) return "Non può superare 100 caratteri";
    return "";
  };

  const validateSkill = (value) => {
    if (!value || !value.trim()) return "Inserisci una competenza";
    if (value.trim().length < 2) return "La competenza deve avere almeno 2 caratteri";
    if (value.trim().length > 50) return "La competenza non può superare 50 caratteri";
    return "";
  };

  const validateProjectTitle = (value) => {
    if (!value) return "";
    if (value.trim().length < 3) return "Il titolo deve avere almeno 3 caratteri";
    if (value.trim().length > 100) return "Il titolo non può superare 100 caratteri";
    return "";
  };

  const validateProjectDescription = (value) => {
    if (!value) return "";
    if (value.trim().length < 10) return "La descrizione deve avere almeno 10 caratteri";
    if (value.trim().length > 500) return "La descrizione non può superare 500 caratteri";
    return "";
  };

  const getNonce = async () => {
    const response = await fetch("/api/auth/nonce");
    const data = await response.json();
    return data.nonce;
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setErrors((prev) => ({ ...prev, description: validateDescription(value) }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };

  const handleGithubChange = (e) => {
    const value = e.target.value;
    setGithub(value);
    setErrors((prev) => ({ ...prev, github: validateURL(value) }));
  };

  const handlePortfolioChange = (e) => {
    const value = e.target.value;
    setPortfolio(value);
    setErrors((prev) => ({ ...prev, portfolio: validateURL(value) }));
  };

  const handleDiscordChange = (e) => {
    const value = e.target.value;
    setDiscord(value);
    setErrors((prev) => ({ ...prev, discord: validateDiscordSlack(value) }));
  };

  const handleSlackChange = (e) => {
    const value = e.target.value;
    setSlack(value);
    setErrors((prev) => ({ ...prev, slack: validateDiscordSlack(value) }));
  };

  const handleSkillInputChange = (e) => {
    const value = e.target.value;
    setSkillInput(value);
    setErrors((prev) => ({ ...prev, skills: "" }));
  };

  const addSkill = () => {
    const skillError = validateSkill(skillInput);

    if (skillError) {
      setErrors((prev) => ({ ...prev, skills: skillError }));
      return;
    }

    const trimmedSkill = skillInput.trim();

    if (keyskills.includes(trimmedSkill)) {
      setErrors((prev) => ({ ...prev, skills: "Questa competenza è già presente" }));
      return;
    }

    if (keyskills.length >= 20) {
      setErrors((prev) => ({ ...prev, skills: "Puoi aggiungere massimo 20 competenze" }));
      return;
    }

    setKeyskills((prev) => [...prev, trimmedSkill]);
    setSkillInput("");
    setErrors((prev) => ({ ...prev, skills: "" }));
  };

  const removeSkill = (index) => {
    setKeyskills((prev) => prev.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, skills: "" }));
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);

    let error = "";
    if (field === 'title') {
      error = validateProjectTitle(value);
    } else if (field === 'description') {
      error = validateProjectDescription(value);
    }

    setErrors((prev) => ({
      ...prev,
      projects: {
        ...prev.projects,
        [`${index}-${field}`]: error
      }
    }));
  };

  const isProjectEmpty = (p) =>
    !p.title?.trim() &&
    !p.description?.trim() &&
    (!p.files || p.files.length === 0);

  const handleProjectFileChange = (index, e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const maxSize = 5 * 1024 * 1024;
    const invalidFiles = selectedFiles.filter(f => f.size > maxSize);

    if (invalidFiles.length > 0) {
      setErrorMessage(`Alcuni file superano i 5MB: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidTypes = selectedFiles.filter(f => !validTypes.includes(f.type));

    if (invalidTypes.length > 0) {
      setErrorMessage(`Tipo di file non supportato. Usa: JPEG, PNG, GIF, WEBP`);
      return;
    }

    const updatedProjects = [...projects];
    const currentImages = updatedProjects[index].files.length;

    if (currentImages + selectedFiles.length > 5) {
      setErrorMessage("Puoi aggiungere massimo 5 immagini per progetto");
      return;
    }

    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));

    updatedProjects[index].files = [
      ...updatedProjects[index].files,
      ...selectedFiles,
    ];
    updatedProjects[index].previews = [
      ...updatedProjects[index].previews,
      ...newPreviews,
    ];

    setProjects(updatedProjects);
    setErrorMessage("");
    e.target.value = "";
  };

  const removeProjectPreview = (projIndex, imgIndex) => {
    const updatedProjects = [...projects];
    const project = updatedProjects[projIndex];

    const urlToRemove = project.previews[imgIndex];
    if (urlToRemove) {
      URL.revokeObjectURL(urlToRemove);
    }

    project.previews = project.previews.filter((_, i) => i !== imgIndex);
    project.files = project.files.filter((_, i) => i !== imgIndex);

    setProjects(updatedProjects);
  };

  const addProject = () => {
    if (projects.length >= 10) {
      setErrorMessage("Puoi aggiungere massimo 10 progetti");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setProjects([
      ...projects,
      { title: "", description: "", files: [], previews: [] },
    ]);
  };

  const removeProject = (index) => {
    if (projects.length === 1) {
      setErrorMessage("Devi avere almeno un progetto");
      return;
    }

    const projectToRemove = projects[index];
    projectToRemove.previews.forEach((url) => URL.revokeObjectURL(url));

    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);

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
      name: validateName(name),
      description: validateDescription(description),
      email: validateEmail(email),
      github: validateURL(github),
      portfolio: validateURL(portfolio),
      discord: validateDiscordSlack(discord),
      slack: validateDiscordSlack(slack),
      skills: keyskills.length === 0 ? "Inserisci almeno una competenza" : "",
      projects: {}
    };

    projects.forEach((project, index) => {
      if (!isProjectEmpty(project)) {
        const titleError = validateProjectTitle(project.title);
        const descError = validateProjectDescription(project.description);

        if (titleError) newErrors.projects[`${index}-title`] = titleError;
        if (descError) newErrors.projects[`${index}-description`] = descError;

        if (project.title && !project.description) {
          newErrors.projects[`${index}-description`] = "La descrizione è obbligatoria se hai inserito un titolo";
        }
        if (project.description && !project.title) {
          newErrors.projects[`${index}-title`] = "Il titolo è obbligatorio se hai inserito una descrizione";
        }
      }
    });

    setErrors(newErrors);

    const hasErrors =
      newErrors.name !== "" ||
      newErrors.description !== "" ||
      newErrors.email !== "" ||
      newErrors.github !== "" ||
      newErrors.portfolio !== "" ||
      newErrors.discord !== "" ||
      newErrors.slack !== "" ||
      newErrors.skills !== "" ||
      Object.keys(newErrors.projects).length > 0;

    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setErrorMessage("Per favore correggi gli errori nel form prima di procedere");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (!window.ethereum) {
        throw new Error("MetaMask non installato. Visita: https://metamask.io");
      }

      const formData = new FormData();
      const nonce = await getNonce();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const role = "freelancer";
      const signedMessage = await signer.signMessage(nonce);

      const nonEmptyProjects = projects.filter((p) => !isProjectEmpty(p));

      const payload = {
        address: address,
        nickname: name.trim(),
        description: description.trim() || undefined,
        email: email.trim() || undefined,
        role: role.toUpperCase(),
        signedMessage: signedMessage,
        nonce: nonce,
        skills: keyskills,
        github: github.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
        discord: discord.trim() || undefined,
        slack: slack.trim() || undefined,
        projects: nonEmptyProjects.map((p) => ({
          title: p.title.trim(),
          description: p.description.trim(),
        })),
      };

      formData.append("data", JSON.stringify(payload));

      projects.forEach((proj, index_project) => {
        proj.files.forEach((file) => {
          formData.append(`${address}_project_${index_project}`, file);
        });
      });

      const response = await fetch("/api/auth/freelancer-signup", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || errData.message || "Errore durante la registrazione");
      }

      const data = await response.json();

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("accessToken", data.accessToken);
      dispatch({ type: "LOGIN", payload: data.user });

      console.log("Registrazione completata:", data.user);

      setTimeout(() => {
        if (data.user.role === "FREELANCER") {
          navigate("/freelancer-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 100);

    } catch (error) {
      console.error("Errore registrazione:", error);

      if (error.code === 4001) {
        setErrorMessage("Hai rifiutato la firma su MetaMask.");
      } else if (error.message.includes("already exists") || error.message.includes("già esistente")) {
        setErrorMessage("Questo wallet è già registrato! Prova a fare login.");
      } else {
        setErrorMessage(error.message || "Errore durante la registrazione");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = (index) => {
    document.getElementById(`file-input-${index}`)?.click();
  };

  const isOperationLoading = loading;

  return (
    <div className="registration-page">
      <div className="registration-page-form">
        <h2 className="registration-page-form-title">Unisciti a noi</h2>

        {errorMessage && (
          <div className="global-error-message">
            {errorMessage}
          </div>
        )}

        {/* Informazioni Base */}
        <h3 className="section-title">Informazioni Base</h3>

        <p className={errors.name ? "title-error" : ""}>Nickname *</p>
        <input
          className={`input-field ${errors.name ? "input-error" : ""}`}
          value={name}
          onChange={handleNameChange}
          type="text"
          placeholder="Es: Mario Rossi"
          disabled={isOperationLoading}
        />
        {errors.name && (
          <div className="message-error">{errors.name}</div>
        )}

        <p className={errors.description ? "title-error" : ""}>Descrizione (Opzionale)</p>
        <textarea
          className={`input-field ${errors.description ? "input-error" : ""}`}
          value={description}
          onChange={handleDescriptionChange}
          rows="4"
          placeholder="Descrivi la tua esperienza, le tue passioni e cosa ti rende unico..."
          disabled={isOperationLoading}
        />
        {errors.description && (
          <div className="message-error">{errors.description}</div>
        )}

        <p className={errors.email ? "title-error" : ""}>Email (Opzionale)</p>
        <input
          type="email"
          value={email}
          className={`input-field ${errors.email ? "input-error" : ""}`}
          onChange={handleEmailChange}
          placeholder="esempio@email.com"
          disabled={isOperationLoading}
        />
        {errors.email && (
          <div className="message-error">{errors.email}</div>
        )}

        {/* Competenze */}
        <h3 className="section-title" style={{ marginTop: "30px" }}>Competenze</h3>

        <p className={errors.skills ? "title-error" : ""}>
          Skills * {keyskills.length > 0 && <span className="skills-count">({keyskills.length}/20)</span>}
        </p>
        <div className="registration-page-form-skills-input">
          <input
            type="text"
            value={skillInput}
            className={`input-field ${errors.skills ? "input-error" : ""}`}
            onChange={handleSkillInputChange}
            placeholder="Es: React, Node.js, Python..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            disabled={isOperationLoading}
          />
          <button
            type="button"
            onClick={addSkill}
            className="registration-page-form-skills-add-btn"
            disabled={isOperationLoading || keyskills.length >= 20}
          >
            Aggiungi
          </button>
        </div>
        {errors.skills && (
          <div className="message-error">{errors.skills}</div>
        )}

        {keyskills.length > 0 && (
          <div className="skills-list">
            {keyskills.map((s, i) => (
              <span className="skill-tag" key={i}>
                {s}{" "}
                <button
                  type="button"
                  className="skill-remove"
                  onClick={() => removeSkill(i)}
                  disabled={isOperationLoading}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Link e Contatti */}
        <h3 className="section-title" style={{ marginTop: "30px" }}>Link e Contatti (Opzionali)</h3>

        <p className={errors.github ? "title-error" : ""}>GitHub</p>
        <input
          type="url"
          value={github}
          className={`input-field ${errors.github ? "input-error" : ""}`}
          onChange={handleGithubChange}
          placeholder="https://github.com/username"
          disabled={isOperationLoading}
        />
        {errors.github && (
          <div className="message-error">{errors.github}</div>
        )}

        <p className={errors.portfolio ? "title-error" : ""}>Portfolio</p>
        <input
          type="url"
          value={portfolio}
          className={`input-field ${errors.portfolio ? "input-error" : ""}`}
          onChange={handlePortfolioChange}
          placeholder="https://portfolio.com"
          disabled={isOperationLoading}
        />
        {errors.portfolio && (
          <div className="message-error">{errors.portfolio}</div>
        )}

        <p className={errors.discord ? "title-error" : ""}>Discord</p>
        <input
          type="text"
          value={discord}
          className={`input-field ${errors.discord ? "input-error" : ""}`}
          onChange={handleDiscordChange}
          placeholder="@username o https://discord.com/users/..."
          disabled={isOperationLoading}
        />
        {errors.discord && (
          <div className="message-error">{errors.discord}</div>
        )}

        <p className={errors.slack ? "title-error" : ""}>Slack</p>
        <input
          type="text"
          value={slack}
          className={`input-field ${errors.slack ? "input-error" : ""}`}
          onChange={handleSlackChange}
          placeholder="@username o link workspace"
          disabled={isOperationLoading}
        />
        {errors.slack && (
          <div className="message-error">{errors.slack}</div>
        )}

        <hr style={{ margin: "30px 0", borderTop: "1px solid #eee" }} />

        {/* Progetti */}
        <h3 className="registration-page-form-projects-title">
          Progetti Portfolio (Opzionali) {projects.length > 0 && <span className="projects-count">({projects.length}/10)</span>}
        </h3>

        {projects.map((proj, idx) => (
          <div key={idx} className="project-container">
            <div className="project-container-inner">
              <h4>Progetto #{idx + 1}</h4>
              {projects.length > 1 && (
                <button
                  className="remove-project-item"
                  type="button"
                  onClick={() => removeProject(idx)}
                  disabled={isOperationLoading}
                >
                  Elimina Progetto
                </button>
              )}
            </div>

            <p>Titolo Progetto</p>
            <input
              className={`input-field ${errors.projects[`${idx}-title`] ? "input-error" : ""}`}
              type="text"
              value={proj.title}
              onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
              placeholder="Es: E-commerce con React"
              disabled={isOperationLoading}
            />
            {errors.projects[`${idx}-title`] && (
              <div className="message-error">{errors.projects[`${idx}-title`]}</div>
            )}

            <p>Descrizione</p>
            <textarea
              rows="4"
              className={`input-field ${errors.projects[`${idx}-description`] ? "input-error" : ""}`}
              value={proj.description}
              onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
              placeholder="Descrivi il progetto, le tecnologie usate e i risultati ottenuti..."
              disabled={isOperationLoading}
            />
            {errors.projects[`${idx}-description`] && (
              <div className="message-error">{errors.projects[`${idx}-description`]}</div>
            )}

            <div style={{ marginTop: "15px" }}>
              <span>
                Immagini del progetto {proj.files.length > 0 && <span className="image-count">({proj.files.length}/5)</span>}
              </span>
            </div>

            <input
              id={`file-input-${idx}`}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleProjectFileChange(idx, e)}
              disabled={isOperationLoading}
            />

            <div className="preview-grid">
              {proj.previews.length === 0 && (
                <button
                  type="button"
                  className="project-image-placeholder"
                  onClick={() => triggerFileInput(idx)}
                  disabled={isOperationLoading}
                >
                  <AddImage />
                </button>
              )}

              {proj.previews.length > 0 && (
                <>
                  {proj.previews.map((src, imgIndex) => (
                    <div
                      className="preview-item"
                      key={imgIndex}
                      style={{ position: "relative" }}
                    >
                      <img className="preview-image" src={src} alt="Preview" />
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={() => removeProjectPreview(idx, imgIndex)}
                        disabled={isOperationLoading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {proj.files.length < 5 && (
                    <button
                      type="button"
                      className="add-image-to-existing"
                      onClick={() => triggerFileInput(idx)}
                      disabled={isOperationLoading}
                    >
                      +
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addProject}
          className="btn-add-project"
          disabled={isOperationLoading || projects.length >= 10}
        >
          + Aggiungi un altro progetto
        </button>

        <button
          className="btn-submit-registration"
          onClick={handleSubmit}
          disabled={isOperationLoading}
        >
          {isOperationLoading ? "Registrazione in corso..." : "Registrati"}
        </button>

        {isOperationLoading && (
          <div className="loading-overlay">
            <div className="loading-box">
              <div className="spinner"></div>
              <div className="loading-text">Registrazione in corso...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;