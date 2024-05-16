import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import { setUserInfo } from '../components/common';


function App() {
    const [ user, setUser ] = useState(null);
    const [ cartItems, setCartItems ] = useState([]);

    const [ searchItems, setSearchItems ] = useState([]);

    useEffect(() => {
        fetch('/authenticate')
        .then(r => 
            r.json().then(data => {
                if (r.ok) {
                    console.log('in App, user: ', data);
                    setUserInfo(data, setUser, setCartItems);
                } else {
                    console.log('In App, error: ', data.message);
                }
            })
        )
    }, []);

    return (
        <div style={{display: 'grid', width: '100%', height: '100%', 
            gridTemplateRows: 'max-content 1fr',}}>
            <header style={{minWidth: '0', minHeight: '0',}}>
                <NavBar user={user} />
            </header>
            <main style={{minWidth: '0', minHeight: '0',}}>
                {/* <h1>I'm at App.</h1> */}
                <Outlet context={{
                    user: user,
                    onSetUser: setUser,
                    cartItems: cartItems,
                    onSetCartItems: setCartItems,
                    searchItems: searchItems,
                    onSetSearchItems: setSearchItems, 
                }} />
            </main>
        </div>
    );
}

export default App;