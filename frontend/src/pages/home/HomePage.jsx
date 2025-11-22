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

import { useState, useEffect } from "react";

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

  // Definisco le fasi come componenti per il carousel
  const phases = [
    {
      number: 1,
      title: "Fase 1",
      description:
        "Cliente crea un annuncio e deposita la somma indicata durante la creazione dentro uno smart contract.",
      icons: (
        <div className="about-phase-1-info-icons">
          <BusinessIcon />
          <DollarCircle />
          <RightArrow />
          <PageImage />
        </div>
      ),
    },
    {
      number: 2,
      title: "Fase 2",
      description: "Un freelancer si candida per l'annuncio.",
      icons: (
        <div className="about-phase-1-info-icons">
          <ManAtWork1 />
        </div>
      ),
    },
    {
      number: 3,
      title: "Fase 3",
      description:
        "Cliente sceglie uno dei candidati che secondo lui sia più adatto per lo svolgimento del lavoro. Il wallet del candidato scelto viene aggiunto nello smart contract creato in precedenza.",
      icons: (
        <div className="about-phase-1-info-icons-multiblock">
          <div className="about-phase-info-icons-block-1">
            <ManAtWork1 />
            <CrossIcon />
          </div>
          <div className="about-phase-info-icons-block-2">
            <ManAtWork1 />
            <CheckIcon />
            <RightArrow />
            <PageImage />
          </div>
          <div className="about-phase-info-icons-block-3">
            <ManAtWork1 />
            <CrossIcon />
          </div>
        </div>
      ),
    },
    {
      number: 4,
      title: "Fase 4",
      description:
        "Freelancer esegue il suo lavoro e una volta finito carica il lavoro svolto, a cui il cliente non avrà ancora accesso.",
      icons: (
        <div className="about-phase-1-info-icons">
          <ManAtWork1 />
          <GearIcon />
          <UploadIcon />
        </div>
      ),
    },
    {
      number: 5,
      title: "Fase 5",
      description: "Freelancer effettua una presentazione del lavoro svolto.",
      icons: (
        <div className="about-phase-1-info-icons">
          <ManAtWork2 />
          <PainterIcon />
        </div>
      ),
    },
    {
      number: 6,
      title: "Fase 6",
      description:
        "Se il cliente è soddisfatto del risultato lo segnala. Freelancer riceve la ricompensa tramite smart contract, cliente riceve l'accesso al lavoro svolto.",
      icons: (
        <div className="about-phase-1-info-icons-multiblock">
          <div className="about-phase-info-icons-block-1">
            <PageImage />
            <RightArrow />
            <DollarCircle />
            <RightArrow />
            <ManAtWork1 />
          </div>
          <div className="about-phase-info-icons-block-2">
            <GearIcon />
            <RightArrow />
            <ManAtWork2 />
          </div>
        </div>
      ),
    },
  ];

  // Crea i componenti per il carousel
  const carouselItems = phases.map((phase) => (
    <div key={phase.number} className="about-phase-card">
      <div className="about-phase-card-header">
        <h3>{phase.title}</h3>
      </div>
      <p className="about-phase-card-description">{phase.description}</p>
      <div className="about-phase-card-icons">{phase.icons}</div>
    </div>
  ));

  return (
    <div className="home-page">
      <div className="home-page-welcome">
        <p>Connect with Top Freelancers Worldwide</p>
      </div>

      <div className="home-page-buttons">
        <button>Sono un freelancer</button>
        <button>Cerco talenti</button>
      </div>

      <div className="home-page-separator" />

      <div className="home-page-about">
        <h2>Come funziona</h2>
      </div>

      {!isMobile ? (
        <div className="home-page-about-inner">
          <div className="about-phase-1">
            <div className="about-phase-1-text">
              fase 1.
              <p>
                Cliente crea un annuncio e deposita la somma indicata durante la
                creazione dentro uno smart contract.
              </p>
            </div>
            <div className="about-phase-1-icons">
              <div className="about-circle" />
              <div className="about-phase-1-info-icons">
                <BusinessIcon />
                <DollarCircle />
                <RightArrow />
                <PageImage />
              </div>
            </div>
          </div>

          <div className="about-phase-1">
            <div className="about-phase-1-text">
              fase 2.
              <p>Un freelancer si candida per l'annuncio.</p>
            </div>
            <div className="about-phase-1-icons">
              <div className="about-circle" />
              <div className="about-phase-1-info-icons">
                <ManAtWork1 />
              </div>
            </div>
          </div>

          <div className="about-phase-1">
            <div className="about-phase-1-text">
              fase 3.
              <p>
                Cliente sceglie uno dei candidati che secondo lui sia più adatto
                per lo svolgimento del lavoro. Il wallet del candidato scelto
                viene aggiunto nello smart contract creato in precedenza.
              </p>
            </div>
            <div className="about-phase-1-icons">
              <div className="about-circle" />
              <div className="about-phase-1-info-icons-multiblock">
                <div className="about-phase-info-icons-block-1">
                  <ManAtWork1 />
                  <CrossIcon />
                </div>

                <div className="about-phase-info-icons-block-2">
                  <ManAtWork1 />
                  <CheckIcon />
                  <RightArrow />
                  <PageImage />
                </div>

                <div className="about-phase-info-icons-block-3">
                  <ManAtWork1 />
                  <CrossIcon />
                </div>
              </div>
            </div>
          </div>

          <div className="about-phase-1">
            <div className="about-phase-1-text">
              fase 4.
              <p>
                Freelancer esegue il suo lavoro e una volta finito carica il
                lavoro svolto, a cui il cliente non avrà ancora accesso.
              </p>
            </div>
            <div className="about-phase-1-icons">
              <div className="about-circle" />
              <div className="about-phase-1-info-icons">
                <ManAtWork1 />
                <GearIcon />
                <UploadIcon />
              </div>
            </div>
          </div>

          <div className="about-phase-1">
            <div className="about-phase-1-text">
              fase 5.
              <p>Freelancer effettua una presentazione del lavoro svolto.</p>
            </div>
            <div className="about-phase-1-icons">
              <div className="about-circle" />
              <div className="about-phase-1-info-icons">
                <ManAtWork2 />
                <PainterIcon />
              </div>
            </div>
          </div>

          <div className="about-phase-1">
            <div className="about-phase-1-text">
              fase 6.
              <p>
                Se il cliente è soddisfatto del risultato lo segnala. Freelancer
                riceve la ricompensa tramite smart contract, cliente riceve
                l'accesso al lavoro svolto.
              </p>
            </div>
            <div className="about-phase-1-icons">
              <div className="about-circle" />
              <div className="about-phase-1-info-icons-multiblock">
                <div className="about-phase-info-icons-block-1">
                  <PageImage />
                  <RightArrow />
                  <DollarCircle />
                  <RightArrow />
                  <ManAtWork1 />
                </div>

                <div className="about-phase-info-icons-block-2">
                  <GearIcon />
                  <RightArrow />
                  <ManAtWork2 />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="home-page-carousel">
          <Carousel items={carouselItems} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
