export default function Navbar() {
    return (
        <nav className="navbar">
            <h2 className="navbar-title">Tatil Takvimi</h2>
            <div className="navbar-links">
                <a href="/" className="navbar-link">Ana Sayfa</a>
                <a href="/about" className="navbar-link">Hakkında</a>
                <a href="/contact" className="navbar-link">İletişim</a>
            </div>
        </nav>
    );
}
