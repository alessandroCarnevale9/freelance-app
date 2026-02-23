import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./AnnouncementReviewPage.css";
import Toast from "../../components/toast/Toast";
import { useAuthContext } from "../../hooks/useAuthContext";
import FreelanceABI from "../../../../contract/artifacts/contracts/Freelance.sol/Freelance.json";

const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "—";

  // If it's already a Date object
  if (value instanceof Date && !isNaN(value)) {
    return value.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // If it's a numeric-like string or number, normalize to milliseconds
  const str = String(value).trim();
  if (/^\d+$/.test(str)) {
    let ts = Number(str);
    // heuristic: if timestamp looks like seconds (<= 1e12) convert to ms
    if (ts < 1e12) ts = ts * 1000;
    return new Date(ts).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Try parsing ISO / readable date string
  const parsed = Date.parse(str);
  if (!isNaN(parsed)) {
    return new Date(parsed).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Fallback: return raw string
  return str;
};

const uploadToIPFS = async (data) => {
  const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

  const body = JSON.stringify({
    pinataOptions: { cidVersion: 1 },
    pinataMetadata: { name: `announcement-${Date.now()}.json` },
    pinataContent: data,
  });

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: import.meta.env.VITE_PINATA_BEARER,
      },
      body: body,
    });
    const data = await res.json();
    return data.IpfsHash;
  } catch (error) {
    console.error("Errore IPFS:", error);
    throw new Error("Fallimento upload IPFS");
  }
};

const unpinFromIPFS = async (cid) => {
  try {
    const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;
    await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: import.meta.env.VITE_PINATA_BEARER,
      },
    });
    console.log(`Rollback: CID ${cid} rimosso da Pinata.`);
  } catch (error) {
    console.error("Errore durante il rollback IPFS:", error);
  }
};

const AnnouncementReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState(null);
  const [originalAnnouncement, setOriginalAnnouncement] = useState(null);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [status, setStatus] = useState("");
  const [statusLabel, setStatusLabel] = useState("");
  const [judgment, setJudgment] = useState("");
  const [reqStatus, setReqStatus] = useState({});
  const [workFile, setWorkFile] = useState("");
  const [isActionLoading, setIsActionLoading] = useState({
    state: false,
    message: "",
  });

  useEffect(() => {
    if (!id) return setLoading(false);
    let ignore = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/announcement/announcements/client-details/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.errors)
          throw new Error(json.errors.map((e) => e.message).join(", "));
        const data = json;
        if (!data) throw new Error("Annuncio non trovato");

        if (ignore) return;

        const formattedCandidates = data.candidates.map((c) => {
          return {
            id: c.address,
            name: c.nickname || "",
            projects: c.projects.length || 0,
            skills: c.keySkills || [],
          };
        });

        setCandidates(formattedCandidates);
        const announcementData = data.announcement;
        setOriginalAnnouncement(announcementData);
        let labelFromStatus = "";
        switch (announcementData.status) {
          case "Open":
            labelFromStatus = "In ricerca del candidato";
            break;
          case "InProgress":
            labelFromStatus = "In lavorazione";
            break;
          case "InProgress_Sent":
            labelFromStatus = "Progetto consegnato";
            break;
          case "Presentation":
            labelFromStatus = "In revisione";
            break;
          case "Completed":
            labelFromStatus = "Completato";
            break;
          case "Cancelled":
            labelFromStatus = "Annullato";
            break;
        }

        setStatus(announcementData.status);
        setStatusLabel(labelFromStatus);

        setAnnouncement({
          id: announcementData.id,
          title: announcementData.title || `Annuncio #${announcementData.id}`,
          summary: announcementData.summary || "",
          skills: announcementData.skills || [],
          requirements: announcementData.requirements || [],
          budget:
            announcementData.budget != null
              ? String(announcementData.budget).includes(".")
                ? announcementData.budget
                : ethers.utils.formatEther(announcementData.budget)
              : "—",
          deadline: announcementData.deadline || null,
          createdAt: announcementData.createdAt || null,
          freelancer: announcementData.freelancer,
          status: announcementData.status || "Open",
        });

        const initialReqStatus = {};
        (announcementData.requirements || []).forEach((req, i) => {
          initialReqStatus[i] = req.done || false;
        });
        setReqStatus(initialReqStatus);
      } catch (err) {
        if (ignore) return;
        console.error("fetch announcement error", err);
        setError(err.message || String(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const result = await fetch(
          `/api/announcement/announcements/project-name/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (!result.ok) throw new Error(`HTTP ${result.status}`);
        const json = await result.json();

        setWorkFile(json.workFileId);
      } catch (err) {
        console.log("fetch project error");
      }
    };

    if (status == "Completed") {
      fetchProject();
    }
  }, [status]);

  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const chooseCandidate = async (candidateId) => {
    setIsActionLoading({
      state: true,
      message: "Selezione del candidato\ncontrolla il walllet MetaMask",
    });
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        FreelanceABI.abi,
        signer
      );
      const tx = await contract.setFreelancer(announcement.id, candidateId);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        addToast("Candidato selezionato", "success");
        await fetch(`/api/announcement/candidates/${announcement.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setStatus("InProgress");
        setStatusLabel("In lavorazione");
      }
    } catch (err) {
      console.error("Errore selezione candidato:", err);
      addToast("Errore durante la selezione del candidato", "error");
    } finally {
      setIsActionLoading({ ...isActionLoading, state: false });
    }

    const c = candidates.find((c) => c.id === candidateId);

    setAnnouncement((prev) => ({
      ...prev,
      freelancer: {
        address: c.id,
        nickname: c.name,
      },
    }));
  };

  const requirePresentation = async (announcementId) => {
    setIsActionLoading({
      state: true,
      message: "Richiesta di revisione\ncontrolla il wallet MetaMask",
    });
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        import.meta.env.VITE_CONTRACT_ADDRESS,
        FreelanceABI.abi,
        signer
      );

      const tx = await contract.requestPresentation(announcementId);
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        addToast("Richiesta di revisione inviata", "success");
        setStatus("Presentation");
        setStatusLabel("In revisione");
      }
    } catch (err) {
      addToast("Errore durante la transazione", "error");
    } finally {
      setIsActionLoading({ ...isActionLoading, state: false });
    }
  };

  const submitJudgment = async (announcementId) => {
    setIsActionLoading({
      state: true,
      message: "Invia giudizio\ncontrolla il wallet MetaMask",
    });
    try {
      switch (judgment) {
        case "completed":
          {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(
              import.meta.env.VITE_CONTRACT_ADDRESS,
              FreelanceABI.abi,
              signer
            );

            const tx = await contract.completeJob(announcementId);
            const receipt = await tx.wait();

            if (receipt.status === 1) {
              addToast("Annuncio completato", "success");
              setStatus("Completed");
              setStatusLabel("Completato");
            }
          }
          break;
        case "incomplete_continue":
          {
            try {
              const response = await fetch(
                `/api/announcement/announcements/project-delete/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                }
              );

              if (!response.ok) {
                const errData = await response.json();
                throw new Error(
                  errData.error ||
                    errData.message ||
                    "Errore durante l'eliminazione del file"
                );
              }
            } catch (err) {
              console.error(
                "Errore durante la cancellazione del progetto:",
                err
              );
              break;
            }

            const originalData = { ...originalAnnouncement };
            const updatedRequirements = originalData.requirements.map(
              (req, i) => ({
                ...req,
                done: reqStatus[i],
              })
            );

            const updatedData = {
              title: originalData.title,
              description: originalData.summary,
              skills: originalData.skills,
              requirements: updatedRequirements,
            };

            const ipfsHash = await uploadToIPFS(updatedData);
            try {
              const provider = new ethers.providers.Web3Provider(
                window.ethereum
              );
              const signer = await provider.getSigner();
              const contract = new ethers.Contract(
                import.meta.env.VITE_CONTRACT_ADDRESS,
                FreelanceABI.abi,
                signer
              );
              const tx = await contract.updateAnnouncementDataAfterPresentation(
                announcementId,
                ipfsHash
              );
              const receipt = await tx.wait();

              if (receipt.status === 1) {
                addToast("Annuncio aggiornato", "success");
                setStatus("InProgress");
                setStatusLabel("In lavorazione");
                await unpinFromIPFS(originalData.dataHash);
              } else {
                await unpinFromIPFS(ipfsHash);
                addToast("Annuncio non aggiornato", "error");
              }
            } catch (err) {
              console.error("Errore aggiornamento annuncio:", err);
              addToast("Errore durante l'aggiornamento dell'annuncio", "error");
              await unpinFromIPFS(ipfsHash);
            }
          }
          break;
        case "incomplete_change":
          {
            try {
              const response = await fetch(
                `/api/announcement/announcements/project-delete/${id}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                }
              );

              if (!response.ok) {
                const errData = await response.json();
                throw new Error(
                  errData.error ||
                    errData.message ||
                    "Errore durante l'eliminazione del file"
                );
              }
            } catch (err) {
              console.error(
                "Errore durante la cancellazione del progetto:",
                err
              );
              break;
            }

            try {
              const provider = new ethers.providers.Web3Provider(
                window.ethereum
              );
              const signer = await provider.getSigner();
              const contract = new ethers.Contract(
                import.meta.env.VITE_CONTRACT_ADDRESS,
                FreelanceABI.abi,
                signer
              );
              const tx = await contract.reOpenAnnouncement(announcementId);
              const receipt = await tx.wait();

              if (receipt.status === 1) {
                addToast("Annuncio aggiornato", "success");
                setStatus("Open");
                setStatusLabel("In ricerca del candidato");
              } else {
                addToast("Annuncio non aggiornato", "error");
              }
            } catch (err) {
              console.error("Errore aggiornamento annuncio:", err);
              addToast("Errore durante l'aggiornamento dell'annuncio", "error");
            }
          }
          break;
      }
    } catch (err) {
      console.error("Errore invio giudizio:", err);
      addToast("Errore durante l'invio del giudizio", "error");
    } finally {
      setIsActionLoading({ ...isActionLoading, state: false });
    }
  };

  const handleReqToggle = (index) => {
    const isSelected = !!reqStatus[index];
    if (!isSelected) {
      const selectedCount = Object.values(reqStatus).filter(Boolean).length;
      if (selectedCount >= announcement.requirements.length - 1) {
        return;
      }
    }

    setReqStatus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="loading-box">
          <div className="spinner"></div>
          <div className="loading-text">Caricamento</div>
        </div>
      </div>
    );

  if (error)
    return <div className="announce-details-page">Errore: {error}</div>;
  if (!announcement)
    return <div className="announce-details-page">Annuncio non trovato</div>;

  return (
    <div className="announce-details-page">
      <div className="details-card">
        <header className="details-header">
          <div className="announce-status">
            <span
              className={`status-pill ${String(status || "").toLowerCase()}`}
            >
              {statusLabel || "Aperto"}
            </span>
          </div>
          <h1 className="details-title">{announcement.title}</h1>
          <div className="client-name">{announcement.client}</div>
        </header>

        <div className="meta-row">
          <div className="meta-box">
            <div className="meta-label">Budget</div>
            <div className="meta-value">ETH {announcement.budget}</div>
          </div>

          <div className="meta-box">
            <div className="meta-label">Deadline</div>
            <div className="meta-value">
              {formatDate(announcement.deadline)}
            </div>
          </div>

          <div className="meta-box">
            <div className="meta-label">Pubblicato</div>
            <div className="meta-value">
              {formatDate(announcement.createdAt)}
            </div>
          </div>
        </div>

        <section className="section">
          <h3>Descrizione</h3>
          <p className="description">
            {announcement.summary || "Nessuna descrizione disponibile."}
          </p>
        </section>

        <section className="section">
          <h3>Competenze richieste</h3>
          <div className="skills-list">
            {announcement.skills.length > 0 ? (
              announcement.skills.map((s, i) => (
                <span key={s + i} className="skill-pill">
                  {s}
                </span>
              ))
            ) : (
              <div className="muted">Nessuna skill specificata.</div>
            )}
          </div>
        </section>

        <section className="section">
          <h3>
            <span className="check-icon">✔︎</span> Requisiti di completamento
          </h3>
          <div className="muted small">
            Tutti i requisiti devono essere completati per considerare il
            progetto concluso.
          </div>

          <ol className="requirements-list">
            {announcement.requirements.length > 0 ? (
              announcement.requirements.map((req, i) => (
                <li key={i} className="requirement-item">
                  <span className="req-badge">{i + 1}</span>
                  <span className="req-text">{req.requirement}</span>
                  {req.done && (
                    <span className="req-completed-badge">Completato</span>
                  )}
                </li>
              ))
            ) : (
              <li className="requirement-item muted">
                Nessun requisito specificato.
              </li>
            )}
          </ol>
        </section>

        <div className="details-footer">
          {status == "InProgress_Sent" && (
            <button
              className="btn primary"
              onClick={() => requirePresentation(announcement.id)}
            >
              Richiedi revisione del progetto
            </button>
          )}
          <Link to={-1} className="btn ghost">
            Torna indietro
          </Link>
        </div>
      </div>

      {(status === "InProgress" ||
        status === "InProgress_Sent" ||
        status === "Presentation") && (
        <div className="details-card" style={{ marginTop: "20px" }}>
          <header className="details-header">
            <h3 className="details-title" style={{ fontSize: "18px" }}>
              Freelancer assegnato
            </h3>
          </header>
          <div
            className="candidate-item"
            style={{ border: "none", padding: 0, background: "transparent" }}
          >
            <div className="candidate-left">
              <div className="avatar">
                {announcement.freelancer.nickname
                  ? announcement.freelancer.nickname
                      .substring(0, 1)
                      .toUpperCase()
                  : "FL"}
              </div>
              <div className="candidate-meta">
                <div className="candidate-name">
                  {announcement.freelancer.nickname || "Freelancer"}
                </div>
              </div>
            </div>
            <div className="candidate-right">
              <button
                className="view-profile-btn"
                onClick={() =>
                  navigate(`/profile/${announcement.freelancer.address}`)
                }
              >
                Visualizza profilo
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "Presentation" && (
        <div className="details-card" style={{ marginTop: "20px" }}>
          <header className="details-header">
            <h3 className="details-title" style={{ fontSize: "18px" }}>
              Giudizio sul lavoro
            </h3>
          </header>
          <div className="judgment-section">
            <div
              className="judgment-options"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="judgment"
                  value="completed"
                  checked={judgment === "completed"}
                  onChange={(e) => setJudgment(e.target.value)}
                />
                Lavoro completato
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="judgment"
                  value="incomplete_continue"
                  checked={judgment === "incomplete_continue"}
                  onChange={(e) => setJudgment(e.target.value)}
                />
                Lavoro incompleto, continua con lo stesso candidato
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="judgment"
                  value="incomplete_change"
                  checked={judgment === "incomplete_change"}
                  onChange={(e) => setJudgment(e.target.value)}
                />
                Lavoro incompleto, cambia candidato
              </label>
            </div>

            {judgment === "incomplete_continue" && (
              <div
                className="requirements-check-list"
                style={{
                  marginTop: "20px",
                  paddingLeft: "20px",
                  borderLeft: "2px solid #eee",
                }}
              >
                <h4 style={{ fontSize: "16px", marginBottom: "10px" }}>
                  Verifica requisiti
                </h4>
                <p className="muted small" style={{ marginBottom: "10px" }}>
                  Indica quali requisiti sono stati soddisfatti:
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {announcement.requirements.map((req, i) => (
                    <label
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!reqStatus[i]}
                        onChange={() => handleReqToggle(i)}
                      />
                      <span>{req.requirement}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: "20px" }}>
              <button
                className="btn primary"
                onClick={() => submitJudgment(announcement.id)}
              >
                Conferma Giudizio
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "Open" && (
        <div className="candidates-card">
          <section className="candidates-section">
            <div className="candidates-header">
              <h3>Candidati</h3>
              <span className="count-bubble">{candidates.length}</span>
            </div>

            <div className="candidates-list">
              {candidates.map((c) => {
                const initials = c.name
                  .split(" ")
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <div key={c.id} className="candidate-item">
                    <div className="candidate-left">
                      <div className="avatar">{initials}</div>
                      <div className="candidate-meta">
                        <div className="candidate-name">{c.name}</div>
                        <div className="candidate-sub muted">
                          Progetti caricati: <strong>{c.projects}</strong>
                        </div>
                        <div className="candidate-skills">
                          {c.skills && c.skills.length > 0 ? (
                            c.skills.map((s, i) => (
                              <span
                                key={s + i}
                                className="skill-pill candidate-skill"
                              >
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="muted small">Nessuna skill</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="candidate-right">
                      <button
                        className="choose-btn"
                        onClick={() => chooseCandidate(c.id)}
                        aria-label={`Scegli candidato ${c.name}`}
                      >
                        Scegli candidato
                      </button>

                      <button
                        className="view-profile-btn"
                        onClick={() => navigate(`/profile/${c.id}`)}
                        aria-label={`Visualizza profilo ${c.name}`}
                      >
                        Visualizza profilo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {status === "Completed" && workFile && (
        <div className="details-card" style={{ marginTop: "20px" }}>
          <header className="details-header">
            <h3 className="details-title" style={{ fontSize: "18px" }}>
              Download Progetto
            </h3>
          </header>
          <div className="section">
            <p className="muted small">
              Scarica il lavoro che aveva consegnato il freelancer.
            </p>
            <div style={{ marginTop: "20px" }}>
              <button
                className="btn primary"
                onClick={async () => {
                  try {
                    const url = `/api/announcement/project-download/${announcement.id}/${workFile}`;

                    const response = await fetch(url, {
                      method: "GET",
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                      },
                    });

                    if (!response.ok) {
                      throw new Error("Errore durante il download del file");
                    }


                    const blob = await response.blob();


                    const downloadUrl = window.URL.createObjectURL(blob);


                    const link = document.createElement("a");
                    link.href = downloadUrl;

                    const cd = response.headers.get('content-disposition') || '';
                    const match = /filename\*?=(?:UTF-8''?)?"?([^;"]+)"?/.exec(cd);
                    const filename = match ? decodeURIComponent(match[1]) : projectName;  



                    link.setAttribute("download", filename);

                    document.body.appendChild(link);
                    link.click();


                    link.remove();
                    window.URL.revokeObjectURL(downloadUrl);
                  } catch (error) {
                    console.error("Download fallito:", error);
                  }
                }}
              >
                Scarica Progetto
              </button>
            </div>
          </div>
        </div>
      )}

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

      {isActionLoading.state && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <div className="loading-text">{isActionLoading.message}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementReviewPage;
