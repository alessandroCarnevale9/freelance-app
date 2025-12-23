import React, { useState, useEffect } from "react";
import {
  BusinessIcon,
  DollarCircle,
  RightArrow,
  PageImage,
  ManAtWork1,
  ManAtWork2,
  PainterIcon,
  CrossIcon,
  CheckIcon,
  GearIcon,
  UploadIcon,
} from "@icons";

import "./HomePage.css";
import Carousel from "../../components/carousel/Carousel";

const HomePage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const phases = [
    {
      id: 1,
      title: "fase 1.",
      description: "Cliente crea un annuncio e deposita la somma indicata durante la creazione dentro uno smart contract.",
      icons: (
        <div className="phase-icons-wrapper">
          <BusinessIcon />
          <DollarCircle />
          <RightArrow />
          <PageImage />
        </div>
      ),
    },
    {
      id: 2,
      title: "fase 2.",
      description: "Un freelancer si candida per l'annuncio.",
      icons: (
        <div className="phase-icons-wrapper">
          <ManAtWork1 />
        </div>
      ),
    },
    {
      id: 3,
      title: "fase 3.",
      description: "Cliente sceglie uno dei candidati che secondo lui sia più adatto per lo svolgimento del lavoro. Il wallet del candidato scelto viene aggiunto nello smart contract creato in precedenza.",
      icons: (
        <div className="phase-icons-multi">
          <div className="icon-group"><ManAtWork1 /><CrossIcon /></div>
          <div className="icon-group"><ManAtWork1 /><CheckIcon /><RightArrow /><PageImage /></div>
          <div className="icon-group"><ManAtWork1 /><CrossIcon /></div>
        </div>
      ),
    },
    {
      id: 4,
      title: "fase 4.",
      description: "Freelancer esegue il suo lavoro e una volta finito carica il lavoro svolto, a cui il cliente non avrà ancora accesso.",
      icons: (
        <div className="phase-icons-wrapper">
          <ManAtWork1 />
          <GearIcon />
          <UploadIcon />
        </div>
      ),
    },
    {
      id: 5,
      title: "fase 5.",
      description: "Freelancer effettua una presentazione del lavoro svolto.",
      icons: (
        <div className="phase-icons-wrapper">
          <ManAtWork2 />
          <PainterIcon />
        </div>
      ),
    },
    {
      id: 6,
      title: "fase 6.",
      description: "Se il cliente è soddisfatto del risultato lo segnala. Freelancer riceve la ricompensa tramite smart contract, cliente riceve l'accesso al lavoro svolto.",
      icons: (
        <div className="phase-icons-multi">
          <div className="icon-group">
            <PageImage /><RightArrow /><DollarCircle /><RightArrow /><ManAtWork1 />
          </div>
          <div className="icon-group">
            <GearIcon /><RightArrow /><ManAtWork2 />
          </div>
        </div>
      ),
    },
  ];


  const carouselItems = phases.map((phase) => (
    <div key={phase.id} className="about-phase-card">
      <div className="about-phase-card-header">
        <h3>{phase.title}</h3>
      </div>
      <p className="about-phase-card-description">{phase.description}</p>
      <div className="about-phase-card-icons">{phase.icons}</div>
    </div>
  ));

  return (
    <div className="home-page">
      <section className="home-page-welcome">
        <p>Connect with Top Freelancers Worldwide</p>
      </section>

      <nav className="home-page-buttons">
        <button className="btn-primary">Sono un freelancer</button>
        <button className="btn-secondary">Cerco talenti</button>
      </nav>

      <div className="home-page-separator" />

      <section className="home-page-about">
        <h2>Come funziona</h2>

        {isMobile ? (
          <div className="home-page-carousel">
            <Carousel items={carouselItems} />
          </div>
        ) : (
          <div className="home-page-about-inner">
            {phases.map((phase) => (
              <div key={phase.id} className="about-phase-row">
                <div className="about-phase-text">
                  <strong>{phase.title}</strong>
                  <p>{phase.description}</p>
                </div>
                <div className="about-phase-visual">
                  <div className="about-circle" />
                  <div className="about-phase-icons-container">
                    {phase.icons}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;