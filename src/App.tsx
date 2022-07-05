import { h, Component } from 'preact';
import { hslToHex } from './Utilities';

interface AppState {
  leftSide: string;
  rightSide: string;
  colorForLeft: string;
  colorForRight: string;
  pick: string;
  mode: string;
  status: string;
  statusClass: string;
}

const ALPHABET = Array.apply(null, Array(26)).map((_, i) => String.fromCharCode(i + 65));
const NUMBERS = Array.apply(null, Array(10)).map((_, i) => String.fromCharCode(i + 48));
const options = ALPHABET.concat(NUMBERS);

function generateColors() {
  const firstHue = Math.random();
  const secondHue = (firstHue + 0.5) % 1;
  return [hslToHex(firstHue * 360, 100, 70), hslToHex(secondHue * 360, 100, 70)];
}

export default class App extends Component<{}, AppState> {
  constructor(props) {
    super(props);
    this.state = this.nextState();
  }

  componentDidMount() {
    this.readWord();
  }

  render() {
    return <div className='container'>
      <button className='left side' style={{backgroundColor: this.state.colorForLeft}} onMouseDown={this.select.bind(this, this.state.leftSide)} onTouchStart={this.select.bind(this, this.state.leftSide)}>{ this.state.leftSide }</button>
      <button className='right side' style={{backgroundColor: this.state.colorForRight}} onMouseDown={this.select.bind(this, this.state.rightSide)} onTouchStart={this.select.bind(this, this.state.rightSide)}>{ this.state.rightSide }</button>
      <button className='mode' onClick={this.changeMode.bind(this)}>{this.getModeName()}</button>
      { this.state.status && <div className={`status ${this.state.statusClass}`}>{this.state.status}</div> }
    </div>;
  }

  changeMode() {
    switch(this.state.mode) {
      case 'ALL':
        this.setState(this.nextState('NUM'), () => {
          this.readWord();
        });
        return;
      case 'NUM':
        this.setState(this.nextState('LET'), () => {
          this.readWord();
        });
        return;
      case 'LET':
        this.setState(this.nextState('ALL'), () => {
          this.readWord();
        });
        return;
    }
  }

  getModeName() {
    switch(this.state.mode) {
      case 'ALL':
        return 'All numbers + letters';
      case 'NUM':
        return 'Numbers';
      case 'LET':
        return 'Letters';
    }
  }

  select(option: string) {
    if (this.state.pick === option) {
      this.setState(this.nextState(undefined, 'Good job!', 'success'), () => {
        this.readWord();
      });
    } else {
      this.setState({status: 'Try again', statusClass: 'error' });
      this.readWord(true);
    }
  }

  nextState(modeOverride?: string, statusOverride?: string, statusClass?: string) {
    const [colorForLeft, colorForRight ] = generateColors();
    const mode = modeOverride || this.state?.mode || 'ALL';
    const allOptions = mode === 'ALL' ? options.slice() : mode === 'NUM' ? NUMBERS.slice() : ALPHABET.slice();
    const firstIndex = Math.floor(allOptions.length * Math.random());
    const firstOption = allOptions.splice(firstIndex, 1);
    const secondIndex = Math.floor(allOptions.length * Math.random());
    const secondOption = allOptions[secondIndex];
    return {
      leftSide: firstOption,
      rightSide: secondOption,
      colorForLeft,
      colorForRight,
      pick: Math.random() > 0.5 ? firstOption : secondOption,
      mode: mode,
      status: statusOverride || this.state?.status,
      statusClass: statusClass || this.state?.statusClass
    };
  }

  readWord(tryAgain?: boolean) {
    const isNumber = /[0-9]/.test(this.state.pick);
    const utterance = new SpeechSynthesisUtterance((tryAgain ? 'Try again. ' : '' ) + (isNumber ? `Press the number ${this.state.pick}` : `Press the letter ${this.state.pick}`));
    utterance.voice = speechSynthesis.getVoices().filter(voice => voice.lang === 'en-AU')[0];
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  }
}