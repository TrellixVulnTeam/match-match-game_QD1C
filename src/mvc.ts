import BaseComponent from './base-component'; 
import Header from './components/header/header';
import AboutPage from './components/about/about';
import RegistrationForm from './components/registration/registration-form';
import GamePage from './components/game/game';


export default function mvc(app: HTMLElement) {
  // View
  class View {
    readonly app: HTMLElement;
    readonly modalFeild: HTMLElement;
    readonly modalWindow: HTMLElement;
    readonly header: Header;
    readonly AboutPage: HTMLElement;
    readonly Game: GamePage;

    constructor(app: HTMLElement) {
      this.app = app;
      this.modalFeild = new BaseComponent().createElement('div', ['modal-feild'], '');
      this.modalWindow = new RegistrationForm().modalWindow;
      this.header = new Header();
      this.AboutPage = new AboutPage().getPage();
      this.Game = new GamePage();
      this.init();
    }
    
    init() {
      this.modalFeild.append(this.modalWindow);
      this.app.before(this.modalFeild);
    }

    showFirstPage() {
      this.app.append(this.header.getHeader());
      this.app.append(this.AboutPage);
    }

    showModalWindow() {
      const modal = document.querySelector('.modal-fon');
      modal?.classList.add('modal-fon_active')      
    }

    hiddenModalWindow() {
      const modal = document.querySelector('.modal-fon');
      const inputs = modal?.querySelectorAll('input');
      
      modal?.classList.remove('modal-fon_active');
      inputs?.forEach(inp => {
        inp.value = '';
        inp.nextElementSibling?.classList.add('error');
      });
    }

    showStartGameButton() {
      const regBtn = this.app.querySelector('#regBtn');
      const startBtn = this.app.querySelector('#startGame');

      regBtn?.classList.add('hidden');
      startBtn?.classList.remove('hidden');
    }

    showStartStopGameButton(id: string, nameBtn: string) {
      const startGame = this.app.querySelector('.header-button-start');
      if (startGame) {
        startGame.id = id;
        const text = startGame.firstElementChild;
        if (text) text.innerHTML = nameBtn;
      }
    }

    showAvatarName(name: string) {
      this.header.name.innerHTML = name;
      this.header.name.classList.toggle('hidden');
    }

    showStatusInput(id: string, status: boolean) {
      const input = this.modalWindow.querySelector(`#${id}`);
      if (status) {
        input?.nextElementSibling?.classList.remove('error');
      } else {
        input?.nextElementSibling?.classList.add('error');
      }
    }

    showStylesdAddButton(status: boolean) {
      const buttonAdd = document.querySelector('#add');
      
      if (!buttonAdd) throw 'error';

      if (status) {
        buttonAdd.classList.add('disabled');
        buttonAdd.classList.remove('active');
      } else {
        buttonAdd.classList.remove('disabled');
        buttonAdd.classList.add('active');
      }
    }

    showGamePage(props: string[], difficulty: string) {
      this.app.lastElementChild?.replaceWith(this.Game.getPage(props, difficulty));
    }

    showRotate(card: Element) {
      this.Game.toRotateCard(card)
    }

    showResultSelect(arrSelect: Element[]) {
      this.Game.getResultSelectCards(arrSelect);
    }

    rotateAllCards() {
      const cards = this.app.querySelectorAll('.card-wrap');

      cards.forEach((card) => {
        this.Game.toRotateAllcards(card);
      });
    }

    showStartTimer() {
      this.Game.timer.startTimer();
    }
    
    showStopTimer() {
      this.Game.timer.stopTimer();
    }

  }
  // Model
  class Model {
    private view: View;
    data: any[];   // переделать как-то на объект
    private arrElementsPressed: Element[];
    private props: any[];
    private difficulty: string;

    constructor(view: View){
      this.view = view;
      this.data = [{firstName: '', lastName: '', email: ''}];  // переделать как-то на объект
      this.arrElementsPressed = [];
      this.props = [];
      this.difficulty = 'easy';
      this.init();
      this.getDataSettings()
    }

    init() {
      this.getLoadFirstPage()
    }

    getLoadFirstPage() {
      this.view.showFirstPage();
    }

    closeModalWindow() {
      this.view.hiddenModalWindow();
    }

    openModalWindow() {
      this.view.showModalWindow();
    }

    checkValueInput(id: string, value: string) {
      const regName = /^[a-zA-Zа-яА-Я]+$/ui;
      const regEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      
      if (id === 'firstName' || id === 'lastName') {
        if (regName.test(value)) {
          this.fillDataArray(id, value);
          this.view.showStatusInput(id, true);
        } else {
          this.fillDataArray(id, '');
          this.view.showStatusInput(id, false);
        }  
      }
      if (id === 'email') {
        if (regEmail.test(value)) {
          this.fillDataArray(id, value);
          this.view.showStatusInput(id, true);
        } else {
          this.fillDataArray(id, '');
          this.view.showStatusInput(id, false);
        }
      }
      this.checkValueData()? this.getStatusDisabledButton(false) : this.getStatusDisabledButton(true);
    }

    checkValueData(): boolean {
      let result = false;
      
      this.data.forEach((data) => {
        if (data.firstName && data.lastName && data.email) {
          result = !result;
        }
      });
      
      return result;
    }

    fillDataArray(id: string, value: string) {
      this.data.forEach((data) => {
        data[id] = value;
      });
    }

    getStatusDisabledButton(status: boolean) {
      this.view.showStylesdAddButton(status);
    }

    checkRegistrationData() {
      if (this.checkValueData()) {
        this.closeModalWindow();
        this.view.showStartGameButton();
        this.view.showAvatarName(this.data[0].firstName);
      }
    }

    getStartGame() {
      this.view.showGamePage(this.props, this.difficulty);
      this.view.showStartTimer();
      this.view.showStartStopGameButton('stopGame', 'stop game');

      setTimeout(() => {
        this.view.rotateAllCards();        
      }, 3000);
    }

    getStopGame() {
      this.view.showStartStopGameButton('startGame', 'start game');
      this.view.showStopTimer();
    }

    async getDataSettings() {
      const rect = await fetch('../setting.json');
      const data = await rect.json();
      this.props = this.getPropsForGame(data, this.difficulty);
    }

    getPropsForGame(data: any, difficulty: string): string[] {
      const value: number = data.difficulty[difficulty];
      const images: [] = data.images.auto.slice(0, value);
      const arr: any[] = images.map((elem) => images);
      const result: string[] = arr.reduce((acc, val) => acc.concat(val), []).sort(() => Math.random() - 0.5);

      return result;
    }

    toRotateCard(element: Element) {
      this.view.showRotate(element);
      this.toFillarrElementsPressed(element);
    }

    toFillarrElementsPressed(element: Element) {
      if (this.arrElementsPressed.length <= 1) {
        this.arrElementsPressed.push(element)
        this.checkElementsPressed(this.arrElementsPressed)
      }
    }

    checkElementsPressed(arr:any[]) {
      if (arr.length === 2) {
        if (arr[0].dataset.value !== arr[1].dataset.value) {
          setTimeout(() => {
            this.view.showResultSelect(arr);
            this.arrElementsPressed = [];
          }, 500)
        } else {
          this.arrElementsPressed = [];
        }
      }
    }

  }

  // Controller
  class Controller {
    readonly app: HTMLElement;
    private model: Model;

    constructor(app: HTMLElement, model: Model){
      this.app = app;
      this.model = model;
      this.init();
    }

    init() {
      const modalWindow = document.querySelector('.modal-feild');
      const addBtn = document.querySelector('#add');
      const cancelBtn = document.querySelector('#cancel');
      const regBtn = this.app.querySelector('#regBtn');
      const inputs = modalWindow?.querySelectorAll('input');

      // get event on modal window
      addBtn?.addEventListener('click', () => {
        this.clickAddBtnModal();
        const startGame = this.app.querySelector('.header-button-start');

        startGame?.addEventListener('click', () => {
          if (startGame.id === 'startGame') {
            this.clickStartGame();
            return;
          }
          if (startGame.id === 'stopGame') {
            this.clickStopGame();
            return;
          }
        })
      })
      
      cancelBtn?.addEventListener('click', () => {
        this.clickCancelBtnModal();
      })

      inputs?.forEach((inp) => {
        inp.addEventListener('change', () => {
          this.getParametrsInput(inp.id, inp.value);
        })
      })
      
      // get event on aap 
      regBtn?.addEventListener('click', () => {
        this.clickNewPlayerBtn();
      })
    }

    clickNewPlayerBtn() {
      this.model.openModalWindow();
    }

    clickCancelBtnModal() {
      this.model.closeModalWindow();
    }

    clickAddBtnModal() {
      this.model.checkRegistrationData();
    }

    getParametrsInput(id: string, value: string) {
      this.model.checkValueInput(id, value);
    }

    clickStartGame() {
      this.model.getStartGame();
      const card = document.querySelectorAll('.card-wrap')

      card.forEach(card => { 
        card.addEventListener('click', () =>{ 
          this.model.toRotateCard(card);
        })
      })
    }

    clickStopGame() {
      this.model.getStopGame();
    }
  }

  const view = new View(app);
  const model = new Model(view);
  const controller = new Controller(app, model);
}