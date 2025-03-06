import React from 'react';
import Watchlist from '../components/Watchlist/Watchlist';

const WatchlistPage = ({ watchlist }) => {
    return (
        <div>
            <Watchlist watchlist={watchlist} />
        </div>
    );
};

export default WatchlistPage;