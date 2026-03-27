import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Auth from './pages/Auth';
import { useState } from 'react';
import { useEffect } from 'react';
import './App.css';

function App() {
    const [openProfile, setOpenProfile] = useState(false);
    const [page, setPage] = useState('dashboard');

    const [initialBalances, setInitialBalances] = useState({
    checking: 0,
    savings: 0,
    cash: 0,
    investments: 0
    });

    const [user, setUser] = useState(
        JSON.parse(localStorage.
            getItem('currentUser'))
    );

    useEffect(() => {
    if (!user) return;

    const fetchBalances = async () => {
        try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/accounts`, {
            headers: {
            Authorization: `Bearer ${user.token}`
            }
        });

        const data = await res.json();

        if (data) {
            setInitialBalances({
            checking: data.checking || 0,
            savings: data.savings || 0,
            cash: data.cash || 0,
            investments: data.investments || 0
            });
        }
        } catch (err) {
        console.error(err);
        }
    };

    fetchBalances();
    }, [user]);
    
    const [transactions, setTransactions] = useState([]);

        useEffect(() => {
        if (!user) return;

        const fetchTransactions = async () => {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
            });

            const data = await res.json();
            setTransactions(data);
        };

        fetchTransactions();
        }, [user]);

    return (
        <div className={user ? "app" : "app auth-mode"}>
            {!user ? (
                // Authentication page (login/register)
                <div className="auth-page">
                    <Auth onLogin={setUser} />
                </div>
            ) : (
                // Main app
                <>
                    <aside className="sidebar">
                        <div>
                            <h2>
                            🐾 {(user?.firstName || "User").toUpperCase()} {(user?.lastName?.charAt(0) || "").toUpperCase()}.
                            {console.log(user)}
                            </h2>

                            <nav>
                                <p
                                    className={page === 'dashboard' ? 'active' : ''}
                                    onClick={() => setPage('dashboard')}
                                >
                                    Dashboard
                                </p>

                                {/* <p
                                    className={page === 'accounts' ? 'active' : ''}
                                    onClick={() => setPage('accounts')}
                                >
                                    Accounts
                                </p> */}

                                <p
                                    className={page === 'settings' ? 'active' : ''}
                                    onClick={() => setPage('settings')}
                                >
                                    Settings
                                </p>
                            </nav>
                        </div>

                        {/* Profile section in the sidebar */}

                        <div className="profile-section">
                            <div
                                className="profile-main"
                                onClick={() => setOpenProfile(!openProfile)}
                            >
                                <div className="avatar">
                                {user?.firstName?.charAt(0)?.toUpperCase() || "U"}
                                </div>

                                <div className="profile-info">
                                    <p className="name">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="email">{user.email}</p>
                                </div>
                                {user?.dob && (
                                <p className="email">
                                    DOB: {new Date(user.dob).toLocaleDateString()}
                                </p>
                                )}
                            </div>

                            {openProfile && (
                                <div className="profile-dropdown">
                                    <p>Profile Settings</p>
                                    <p
                                        onClick={() => {
                                            localStorage.removeItem('currentUser');
                                            setUser(null);
                                        }}
                                    >
                                        Log Out
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* main content that is to be rendered (dashboard) */}

                    <main className="main">
                        {page === 'dashboard' && (
                            <Dashboard
                            initialBalances={initialBalances}
                            transactions={transactions}
                            setTransactions={setTransactions}
                            />
                        )}

                        {/* {page === 'accounts' && (
                        <Accounts
                            initialBalances={initialBalances}
                            setInitialBalances={setInitialBalances}
                            transactions={transactions} 
                        />
                        )} */}
                    </main>
                </>
            )}
        </div>
    );
}

export default App;