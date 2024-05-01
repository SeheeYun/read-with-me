import Content from './Content';
import { ShadowDom } from './ShadowDom';
import { render } from './render';
import './index.css';
// import styles from './Content.css';

// console.log('style', styles);

const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.toggle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease-in;
  &.play{
    background: #2f80f5;
    > svg {
      fill: #fff;
    }
  }
  &.pause{
    background: #fff;
    > svg {
      fill: #00000091;
    }
  }
}

.speed {
  display: flex;
  flex-direction: column;
  gap: 6px;
  .button{
    > svg {
      fill: #ffffffb8;
    }
  }
}

.arrow {
  margin-right: 6px;
  > svg {
    fill: #ffffffb8;
  }
  .button__text {
    margin-left: -4px;
  }
}

.close {
  > svg {
    fill: #ffffff8c;
  }
}

.controller_wrapper {
  position: fixed;
  top: calc(50% - 70px);
  right: 2%;
  z-index: 999;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  padding: 16px 4px;
  border: 0.6px solid;
  border-color: #404040;

  /* blur effect */
  background-color: #000000a3;
  border-radius: 20px;
  box-shadow: 0 10px 15px rgb(0 0 0 / 30%);
  backdrop-filter: blur(10px);
  background-blend-mode: overlay;
}
`;

render(
  <ShadowDom>
    <style type="text/css">{styles}</style>
    <Content />
  </ShadowDom>
);
