import "./RegistrationPage.css";
import { useState, useEffect, useRef } from "react";
import { AddImage } from "@icons";
import { ethers } from "ethers";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  const [name, setName] = useState("");
  const [titles, setTitles] = useState("");
  const [keyskills, setKeyskills] = useState([]);

  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({
    name: false,
    titles: false,
    skills: false,
  });

  const [projects, setProjects] = useState([
    { title: "", description: "", link: "", files: [], previews: [] },
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

  const getNonce = async () => {
    const response = await fetch("/api/auth/nonce");
    const data = await response.json();
    return data.nonce;
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, name: false }));
  };

  const handleTitleChange = (e) => {
    setTitles(e.target.value);
    if (e.target.value.trim())
      setErrors((prev) => ({ ...prev, titles: false }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) {
      setErrors((prev) => ({ ...prev, skills: true }));
      return;
    }
    setKeyskills((prev) => [...prev, skillInput.trim()]);
    setSkillInput("");
    setErrors((prev) => ({ ...prev, skills: false }));
  };

  const removeSkill = (index) => {
    setKeyskills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...projects];
    updatedProjects[index][field] = value;
    setProjects(updatedProjects);
  };

  const isProjectEmpty = (p) =>
    !p.title?.trim() &&
    !p.description?.trim() &&
    !p.link?.trim() &&
    (!p.files || p.files.length === 0);

  const handleProjectFileChange = (index, e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const newPreviews = selectedFiles.map((f) => URL.createObjectURL(f));

    const updatedProjects = [...projects];
    updatedProjects[index].files = [
      ...updatedProjects[index].files,
      ...selectedFiles,
    ];
    updatedProjects[index].previews = [
      ...updatedProjects[index].previews,
      ...newPreviews,
    ];

    setProjects(updatedProjects);
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
    setProjects([
      ...projects,
      { title: "", description: "", link: "", files: [], previews: [] },
    ]);
  };

  const removeProject = (index) => {
    // Revoca le URL delle preview prima di rimuovere il progetto
    const projectToRemove = projects[index];
    projectToRemove.previews.forEach((url) => URL.revokeObjectURL(url));

    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
  };

  const handleSubmit = async () => {
    const newErrors = {
      name: !name.trim(),
      titles: !titles.trim(),
      skills: keyskills.length === 0,
    };

    setErrors(newErrors);
    if (newErrors.name || newErrors.titles || newErrors.skills) {
      setErrorMessage("Per favore completa tutti i campi obbligatori");
      // Scroll to top per mostrare l'errore
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      if (!window.ethereum) {
        throw new Error(
          "MetaMask non installato. Visita: https://metamask.io"
        );
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
        nickname: name,
        role: role.toUpperCase(),
        signedMessage: signedMessage,
        nonce: nonce,
        title: titles,
        skills: keyskills,
        projects: nonEmptyProjects.map((p) => ({
          title: p.title,
          description: p.description,
          link: p.link,
        })),
      };

      formData.append("data", JSON.stringify(payload));

      // Aggiungi i file al formData
      projects.forEach((proj, index_project) => {
        proj.files.forEach((file) => {
          formData.append(`${address}_project_${index_project}`, file);
        });
      });

      const response = await fetch("/api/auth/freelancer-signup", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("jwt", JSON.stringify(data));
        dispatch({ type: "LOGIN", payload: data });

        console.log("Registrazione completata");

        // Redirect alla dashboard o home
        navigate("/dashboard");
      } else {
        const errData = await response.json();
        throw new Error(errData.message || "Errore durante la registrazione");
      }
    } catch (error) {
      console.error("Errore registrazione:", error);

      if (error.code === 4001) {
        setErrorMessage("Hai rifiutato la firma su MetaMask.");
      } else if (error.message.includes("already exists")) {
        setErrorMessage("Questo wallet è già registrato! Prova a fare login.");
      } else {
        setErrorMessage(error.message || "Errore durante la registrazione");
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // Handler per aprire il file input di un progetto specifico
  const triggerFileInput = (index) => {
    document.getElementById(`file-input-${index}`)?.click();
  };

  return (
    <div className="registration-page">
      <div className="registration-page-form">
        <h2 className="registration-page-form-title">Unisciti a noi</h2>

        {errorMessage && (
          <div className="global-error-message">
            {errorMessage}
          </div>
        )}

        <p className={errors.name ? "title-error" : ""}>Nome*</p>
        <input
          className={`input-field ${errors.name ? "input-error" : ""}`}
          value={name}
          onChange={handleNameChange}
          type="text"
          disabled={loading}
        />
        {errors.name && (
          <div className="message-error">Inserisci il tuo nome</div>
        )}

        <p className={errors.titles ? "title-error" : ""}>
          Titolo professionale*
        </p>
        <input
          type="text"
          value={titles}
          className={`input-field ${errors.titles ? "input-error" : ""}`}
          onChange={handleTitleChange}
          disabled={loading}
        />
        {errors.titles && (
          <div className="message-error">
            Inserisci il tuo titolo professionale
          </div>
        )}

        <p className={errors.skills ? "title-error" : ""}>Key skills*</p>
        <div className="registration-page-form-skills-input">
          <input
            type="text"
            value={skillInput}
            className={`input-field ${errors.skills ? "input-error" : ""}`}
            onChange={(e) => {
              setSkillInput(e.target.value);
              setErrors((prev) => ({ ...prev, skills: false }));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            disabled={loading}
          />
          <button
            type="button"
            onClick={addSkill}
            className="registration-page-form-skills-add-btn"
            disabled={loading}
          >
            Aggiungi
          </button>
        </div>
        {errors.skills && (
          <div className="message-error">Inserisci almeno una skill</div>
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
                  disabled={loading}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <hr style={{ margin: "30px 0", borderTop: "1px solid #eee" }} />

        <h3 className="registration-page-form-projects-title">Progetti</h3>

        {projects.map((proj, idx) => (
          <div key={idx} className="project-container">
            <div className="project-container-inner">
              <h4>Progetto #{idx + 1}</h4>
              {projects.length > 1 && (
                <button
                  className="remove-project-item"
                  type="button"
                  onClick={() => removeProject(idx)}
                  disabled={loading}
                >
                  Elimina Progetto
                </button>
              )}
            </div>

            <p>Titolo Progetto</p>
            <input
              className="input-field"
              type="text"
              value={proj.title}
              onChange={(e) =>
                handleProjectChange(idx, "title", e.target.value)
              }
              disabled={loading}
            />

            <p>Descrizione</p>
            <textarea
              rows="4"
              className="input-field"
              value={proj.description}
              onChange={(e) =>
                handleProjectChange(idx, "description", e.target.value)
              }
              disabled={loading}
            />

            <p>Link (Opzionale)</p>
            <input
              className="input-field"
              type="text"
              value={proj.link}
              onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
              disabled={loading}
            />

            <div style={{ marginTop: "15px" }}>
              <span>Immagini del progetto</span>
            </div>

            {/* File input nascosto per ogni progetto */}
            <input
              id={`file-input-${idx}`}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => handleProjectFileChange(idx, e)}
              disabled={loading}
            />

            <div className="preview-grid">
              {proj.previews.length === 0 && (
                <button
                  type="button"
                  className="project-image-placeholder"
                  onClick={() => triggerFileInput(idx)}
                  disabled={loading}
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
                        disabled={loading}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="add-image-to-existing"
                    onClick={() => triggerFileInput(idx)}
                    disabled={loading}
                  >
                    +
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addProject}
          className="btn-add-project"
          disabled={loading}
        >
          + Aggiungi un altro progetto
        </button>

        <button
          className="btn-submit-registration"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Registrazione in corso..." : "Registrati"}
        </button>

        {loading && (
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