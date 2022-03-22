import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    .normal-flex {
        display: flex;
        align-items: center;
    }

    .flex-space {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .flex {
        flex: 1;
    }

    .flex-center {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .col-flex {
        display: flex;
        flex-direction: column;
    }

    .col-flex-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
`;

export default GlobalStyle;
