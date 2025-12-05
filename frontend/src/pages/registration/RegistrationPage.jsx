import './RegistrationPage.css';
import { useState, useEffect, useRef } from 'react';
import { AddImage } from '@icons';
import { ethers } from "ethers";

const RegistrationPage = () => {

  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [titles, setTitles] = useState('');
  const [keyskills, setKeyskills] = useState([]);
  
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState({
    name: false,
    titles: false,
    skills: false
  });

  const [projects, setProjects] = useState([
    { title: '', description: '', link: '', files: [], previews: [] }
  ]);

  useEffect(() => {
    return () => {
      projects.forEach(p => {
        p.previews.forEach(url => URL.revokeObjectURL(url));
      });
    };
  }, []);

  const getNonce = async () => {
    const response = await fetch('/api/auth/nonce');
    const data = await response.json();
    return data.nonce;
  }

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (e.target.value.trim()) setErrors(prev => ({ ...prev, name: false }));
  };

  const handleTitleChange = (e) => {
    setTitles(e.target.value);
    if (e.target.value.trim()) setErrors(prev => ({ ...prev, titles: false }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) {
      setErrors(prev => ({ ...prev, skills: true }));
      return;
    }
    setKeyskills(prev => [...prev, skillInput.trim()]);
    setSkillInput('');
    setErrors(prev => ({ ...prev, skills: false }));
  };

  const removeSkill = (index) => {
    setKeyskills(prev => prev.filter((_, i) => i !== index));
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

    const newPreviews = selectedFiles.map(f => URL.createObjectURL(f));

    const updatedProjects = [...projects];
    updatedProjects[index].files = [...updatedProjects[index].files, ...selectedFiles];
    updatedProjects[index].previews = [...updatedProjects[index].previews, ...newPreviews];
    
    setProjects(updatedProjects);
    e.target.value = '';
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
    setProjects([...projects, { title: '', description: '', link: '', files: [], previews: [] }]);
  };


  const removeProject = (index) => {
    const updatedProjects = projects.filter((_, i) => i !== index);
    setProjects(updatedProjects);
  };

  const handleSubmit = async () => {

    const newErrors = {
      name: !name.trim(),
      titles: !titles.trim(),
      skills: keyskills.length === 0
    };

    setErrors(newErrors);
    if (newErrors.name || newErrors.titles || newErrors.skills) return;

    const formData = new FormData();

    const nonce = await getNonce();

    if(window.ethereum != null) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const role = "freelancer";
      const signedMessage = await signer.signMessage(nonce);

      const nonEmptyProjects = projects.filter(p => !isProjectEmpty(p));

      const payload = {
      address: address,
      nickname: name,
      role: role.toUpperCase(),
      signedMessage: signedMessage,
      nonce: nonce,
      title: titles,
      skills: keyskills,
      projects: nonEmptyProjects.map(p => ({
        title: p.title,
        description: p.description,
        link: p.link
        }))
      };

    formData.append('data', JSON.stringify(payload));

    projects.forEach((proj, index_project) => {
      proj.files.forEach((file, index) => {
        formData.append(`${address}_project_${index_project}`, file);
      });
    });

    try {
      const response = await fetch('/api/auth/freelancer-signup', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registrazione completata:', data);
      } else {
        const errData = await response.json();
        console.error('Errore:', errData);
      }
    } catch (error) {
      console.error('Errore di rete:', error);
    }
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="registration-page">
      <div className="registration-page-form">
        <h2 className='registration-page-form-title'>Unisciti a noi</h2>
        
        <p className={errors.name ? 'title-error' : ''}>Nome*</p>
        <input 
          className={`input-field ${errors.name ? 'input-error' : ''}`}
          value={name}
          onChange={handleNameChange}
          type="text"
        />
        {errors.name && <div className="message-error">Inserisci il tuo nome</div>}

        <p className={errors.titles ? 'title-error' : ''}>Titolo professionale*</p>
        <input 
          type="text"
          value={titles}
          className={`input-field ${errors.titles ? 'input-error' : ''}`}
          onChange={handleTitleChange}
        />
        {errors.titles && <div className="message-error">Inserisci il tuo titolo professionale</div>}

        <p className={errors.skills ? 'title-error' : ''}>Key skills*</p>
        <div className="registration-page-form-skills-input">
          <input 
            type="text"
            value={skillInput}
            className={`input-field ${errors.skills ? 'input-error' : ''}`}
            onChange={(e) => {
              setSkillInput(e.target.value);
              setErrors(prev => ({...prev, skills: false}));
            }}
            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
          />
          <button type="button" onClick={addSkill} className="registration-page-form-skills-add-btn">
            Aggiungi
          </button>
        </div>
        {errors.skills && <div className="message-error">Inserisci almeno una skill</div>}

        {keyskills.length > 0 && (
          <div className="skills-list">
            {keyskills.map((s, i) => (
              <span className="skill-tag" key={i}>
                {s} <button type="button" className="skill-remove" onClick={() => removeSkill(i)}>✕</button>
              </span>
            ))}
          </div>
        )}

        <hr style={{ margin: '30px 0', borderTop: '1px solid #eee' }} />

        <h3 className="registration-page-form-projects-title">Progetti</h3>
        
        {projects.map((proj, idx) => (
          <div key={idx} className="project-container">
            <div className="project-container-inner">
              <h4>Progetto #{idx + 1}</h4>
              {projects.length > 1 && (
                <button className="remove-project-item" type="button" onClick={() => removeProject(idx)} >
                  Elimina Progetto
                </button>
              )}
            </div>

            <p>Titolo Progetto</p>
            <input 
              className='input-field' 
              type="text" 
              value={proj.title}
              onChange={(e) => handleProjectChange(idx, 'title', e.target.value)}
            />

            <p>Descrizione</p>
            <textarea 
              rows="4" 
              className='input-field'
              value={proj.description}
              onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
            />

            <p>Link (Opzionale)</p>
            <input 
              className='input-field' 
              type="text"
              value={proj.link}
              onChange={(e) => handleProjectChange(idx, 'link', e.target.value)}
            />

            <div style={{ marginTop: '15px' }}>
              <span>Immagini del progetto</span>
            </div>

            <input
              id={`file-input-${idx}`}
              type="file"
              ref = {fileInputRef}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleProjectFileChange(idx, e)}
            />

            <div className="preview-grid">
              
              {
              proj.previews.length === 0 && (
              <label htmlFor={`file-input-${idx}`} className="project-image-placeholder">
                <AddImage />
              </label>
              )
              }
              
              {proj.previews.length > 0 && (
                <div className="preview-grid">
                  {proj.previews.map((src, imgIndex) => (
                    <div className="preview-item" key={imgIndex} style={{ position: 'relative' }}>
                      <img
                        className="preview-image"
                        src={src}
                        alt="Preview"
                      />
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={() => removeProjectPreview(idx, imgIndex)}
                      >
                        ✕
                      </button>
                    </div>
                    ))}
                    <button className='add-image-to-existing' onClick={handleImageClick}>+</button>
                </div>
                    )}
              
            </div>
          </div>
        ))}

        <button type="button" onClick={addProject} className="btn-add-project">
          + Aggiungi un altro progetto
        </button>

        <button className='btn-submit-registration' onClick={handleSubmit}>
          Registrati
        </button>

      </div>
    </div>
  );
}

export default RegistrationPage;