import './footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__content">
        <span className="footer__author">Created by William R. J. Ribeiro</span>
        <div className="footer__links">
          <a
            href="https://github.com/williamrjribeiro/btc-guesser"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            GitHub
          </a>
          <a
            href="https://github.com/williamrjribeiro/btc-guesser/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__link"
          >
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
}
