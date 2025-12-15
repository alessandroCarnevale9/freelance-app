import { useState, useRef } from "react";
import "./AnnouncementCreationPage.css";

const AnnouncementCreationPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [requirements, setRequirements] = useState([]);
  const [errors, setErrors] = useState({});
  const dateRef = useRef(null);

  const addSkill = () => {
    const s = skillsInput
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    if (s.length === 0) {
      setErrors((prev) => ({ ...prev, skills: true }));
      return;
    }
    setSkills((prev) => [...prev, ...s]);
    setSkillsInput("");
    setErrors((prev) => ({ ...prev, skills: false }));
  };

  const removeSkill = (idx) =>
    setSkills((prev) => prev.filter((_, i) => i !== idx));

  const addRequirement = () => {
    if (!requirementInput.trim()) {
      setErrors((prev) => ({ ...prev, requirement: true }));
      return;
    }
    setRequirements((prev) => [...prev, requirementInput.trim()]);
    setRequirementInput("");
    setErrors((prev) => ({ ...prev, requirement: false }));
  };

  const removeRequirement = (idx) =>
    setRequirements((prev) => prev.filter((_, i) => i !== idx));

  const handleDateIconClick = () =>
    dateRef.current?.showPicker?.() || dateRef.current?.focus();

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const newErrors = {};
    if (!title.trim()) newErrors.title = true;
    if (!description.trim()) newErrors.description = true;

    if (!deadline) newErrors.deadline = true;

    if (!budget || String(budget).trim() === "") newErrors.budget = true;

    if (!requirements || requirements.length === 0) newErrors.requirement = true;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      title,
      description,
      skills,
      budget: budget ? Number(budget) : null,
      deadline,
      requirements,
    };

    console.log("submit payload", payload);
  };

  return (
    <div className="announce-page">
      <div className="announce-page-inner">
        <h1 className="page-title">Crea il tuo annuncio</h1>
        <p className="page-sub">
          Descrivi il tuo progetto in dettaglio per attirare i migliori
        </p>

        <form className="card form-card" onSubmit={handleSubmit} noValidate>
          <section className="section-details">
            <h3 className="section-details-title">Dettagli del progetto</h3>

            <label className="label">Titolo *</label>
            <input
              className={`input ${errors.title ? "input-error" : ""}`}
              placeholder="es., Costruisci un sito e‑commerce responsive"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title)
                  setErrors((prev) => ({ ...prev, title: false }));
              }}
            />
            {errors.title && (
              <div className="text-error">
                Inserisci il titolo del progetto
              </div>
            )}

            <label className="label">Descrizione del progetto *</label>
            <textarea
              className={`textarea ${errors.description ? "input-error" : ""}`}
              placeholder="Descrivi il tuo progetto in dettaglio. Includi obiettivi, requisiti e deliverable specifici..."
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: false }));
              }}
            />
            {errors.description && (
              <div className="text-error">
                Inserisci la descrizione del progetto
              </div>
            )}

            <div className="row">
              <div style={{ flex: 1 }}>
                <label className="label">Skills necessari</label>
                <div className="skills-input">
                  <input
                    className={`input ${errors.skills ? "input-error" : ""}`}
                    placeholder="es., React, Node.js"
                    value={skillsInput}
                    onChange={(e) => {
                      setSkillsInput(e.target.value);
                      if (errors.skills)
                        setErrors((prev) => ({ ...prev, skills: false }));
                    }}
                  />
                  <button
                    type="button"
                    className="btn small"
                    onClick={addSkill}
                  >
                    Add
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="skills-list">
                    {skills.map((s, i) => (
                      <span key={s + i} className="skill-tag">
                        {s}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => removeSkill(i)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ width: 220, marginLeft: 16 }}>
                <label className="label">Budget ETH *</label>
                <input
                  className={`input ${errors.budget ? "input-error" : ""}`}
                  placeholder="es., 1.20"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value.replace(/[^\d.]/g, ""));
                    if (errors.budget) setErrors((prev) => ({ ...prev, budget: false }));
                  }}
                />
                {errors.budget && (
                  <div className="text-error">
                    Inserisci il budget
                  </div>
                )}
              </div>

              <div style={{ width: 220, marginLeft: 16 }}>
                <label className="label">Deadline *</label>
                <div className="date-wrapper">
                  <input
                    ref={dateRef}
                    type="date"
                    className={`input date-input ${errors.deadline ? "input-error" : ""}`}
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      if (errors.deadline) setErrors((prev) => ({ ...prev, deadline: false }));
                    }}
                  />
                  <button
                    type="button"
                    className="date-icon"
                    onClick={handleDateIconClick}
                    aria-label="Open calendar"
                  >
                  </button>
                </div>
                {errors.deadline && (
                  <div className="text-error">
                    Deadline obbligatoria
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="section-requirements">
            <h3 className="section-requirements-title">Requisiti di completamento</h3>
            <p className="section-requirements-desctiption">
              Tutti i requisiti che il freelancer deve soddisfare per completare
              per considerare il progetto come finito.
            </p>

            <div className="req-input-row">
              <input
                className={`input ${errors.requirement ? "input-error" : ""}`}
                placeholder="es., Sito responsive pienamente funzionante"
                value={requirementInput}
                onChange={(e) => {
                  setRequirementInput(e.target.value);
                  if (errors.requirement)
                    setErrors((prev) => ({ ...prev, requirement: false }));
                }}
              />
              <button
                type="button"
                className="btn add-req"
                onClick={addRequirement}
              >
                +
              </button>
            </div>

            {requirements.length === 0 ? (
              <div className="empty-req">
                <div className="empty-req-icon">✔︎</div>
                <div className="empty-req-text">
                  Nessun requisito aggiunto. Aggiungi almeno un requisito.
                </div>
              </div>
            ) : (
              <ul className="req-list">
                {requirements.map((r, i) => (
                  <li key={r + i} className="req-item">
                    <span>{r}</span>
                    <button
                      type="button"
                      className="remove-req"
                      onClick={() => removeRequirement(i)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.requirement && (
              <div className="text-error">
                Aggiungi almeno un requisito di completamento
              </div>
            )}
          </section>

          <div className="form-actions">
            <button className="btn primary" type="submit">
              Pubblica l'Annuncio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementCreationPage;
