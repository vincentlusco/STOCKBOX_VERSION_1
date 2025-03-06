import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #00FF00;
    background-color: #000000;
`;

const Logo = styled.div`
    font-size: 24px;
    color: #00FF00;
    &:after {
        content: '_';
        animation: blink 1s step-end infinite;
    }
`;

const Nav = styled.nav`
    display: flex;
    gap: 30px;
`;

const NavLink = styled(Link)`
    color: #00FF00;
    text-decoration: none;
    position: relative;
    
    &:hover {
        &:before {
            content: '>';
            position: absolute;
            left: -15px;
        }
    }
`;

const Header = () => {
    return (
        <HeaderContainer className="terminal-text">
            <Logo>STOCKBOX_V1</Logo>
            <Nav>
                <NavLink to="/terminal">TERMINAL</NavLink>
                <NavLink to="/watchlist">WATCHLIST</NavLink>
                <NavLink to="/chart">CHART</NavLink>
                <NavLink to="/help">HELP</NavLink>
            </Nav>
        </HeaderContainer>
    );
};

export default Header;