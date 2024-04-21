import Content from './Content';
import { ShadowDom } from './ShadowDom';
import { render } from './render';
import './index.css';
// import styles from './Content.css';

// console.log('style', styles);

const styles = `
.read-with-me__controller {
    position: fixed;
    width: 300px;
    height: 300px;
    top: 50%;
    right: 0;
    background-color: beige;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    z-index: 1000;
  }

  .read-with-me__button {
    background: white;
    border: none;
    border-radius: 50%;
    padding: 8px;
  }
`;

render(
  <ShadowDom>
    <style type="text/css">{styles}</style>
    <Content />
  </ShadowDom>
);
