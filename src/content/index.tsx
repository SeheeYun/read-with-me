import Content from './Content';
import { ShadowDom } from './ShadowDom';
import { render } from './render';
import './index.css';

const styles = `
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  color: #ffffff;
  font-size: 14px;
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

svg {
  fill: #ffffffb8;
}

.controller_wrapper {
  position: fixed;
  top: calc(50% - 100px);
  right: 14px;
  z-index: 999;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 16px;
  padding: 8px 6px;

  /* blur effect */
  background-color: #000000a3;
  border-radius: 100px;
  box-shadow: 0 10px 15px rgb(0 0 0 / 30%);
  backdrop-filter: blur(20px);
  background-blend-mode: overlay;
  border: 0.6px solid;
  border-color: #242424;
}

.toggle {
  width: 36px;
  height: 36px;
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
  align-items: center;
  gap: 6px;
}

.voice {
  position: relative;
  .button {
    margin-left: -4px;
  }
  .button__text {
    text-wrap: nowrap;
    margin-left: -4px;
    width: 24px;
    text-align: left;
  }
}

.voice_selector {
  height: 300px;
  overflow-y: scroll;
  list-style: none;
  position: absolute;
  right: 54px;
  top: 0px;
  padding: 16px 6px;

  background-color: #575757;
  border-radius: 8px;
  box-shadow: 0 10px 15px rgb(0 0 0 / 30%);
  border: 0.6px solid;
  border-color: #242424;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.voice_selector::-webkit-scrollbar {
  display: none;
}
.voice_selector.visible {
 display: block;
}
.voice_selector.hidden {
  display: none;
}

.voice_selector__item {
  text-wrap: nowrap;
  padding: 4px 10px;
  border-radius: 6px;

  display: flex;
  align-items: center;
}
.voice_selector__icon {
  width: 18px;
  padding-top: 2px;
}
.voice_selector__item:hover {
  background-color: #808080;
} 

.close {
  margin-bottom: 4px;
}
`;

render(
  <ShadowDom>
    <style type="text/css">{styles}</style>
    <Content />
  </ShadowDom>
);
