import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ThemeContext } from '../../context/ThemeContext';

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid ${(props) => props.theme.borderColor};
    background-color: ${(props) => props.theme.background};
`;

const Logo = styled.div`
    font-size: 24px;
    color: ${(props) => props.theme.textColor};
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
    color: ${(props) => props.theme.textColor};
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
    const { theme, userName } = useContext(ThemeContext);

    return (
        <HeaderContainer theme={theme} className="terminal-text">
            <Logo theme={theme}>{userName ? `${userName.toUpperCase()}'S ` : ''}STOCKBOX_V1</Logo>
            <Nav>
                <NavLink theme={theme} to="/terminal">TERMINAL</NavLink>
                <NavLink theme={theme} to="/watchlist">WATCHLIST</NavLink>
                <NavLink theme={theme} to="/chart">CHART</NavLink>
                <NavLink theme={theme} to="/help">HELP</NavLink>
                <NavLink theme={theme} to="/settings">SETTINGS</NavLink>
            </Nav>
        </HeaderContainer>
    );
};

export default Header;