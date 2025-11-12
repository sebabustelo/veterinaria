import Register from '../../components/Register'
import Header from '../../components/estaticos/Header';
import Footer from '../../components/estaticos/Footer';

const Registrarse = () => {
    return (
        <>
            <Header />
            <div className="main-content">                
                    <Register />                
            </div>
            <Footer />
        </>
    );
}

export default Registrarse;

