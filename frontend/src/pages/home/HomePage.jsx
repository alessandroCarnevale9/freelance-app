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

const HomePage = () => {
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
            <p>Un freelancer si candida per l’annuncio.</p>
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
              Cliente sceglie uno dei candidati che secondo lui sia piu` adatto
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
              lavoro svolto, a cui il cliente non avra` ancora accesso.
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
              Se il cliente e` soddisfatto del risultato lo segnale. Freelancer
              riceve la ricompensa tramite smart contract, cliente riceve
              l’accesso al lavoro svolto.
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
    </div>
  );
};

export default HomePage;
