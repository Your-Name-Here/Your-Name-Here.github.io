// Console web component
class Console extends HTMLElement {
    constructor(){
        super();
        this._question = null;
        // create a container div
        this._console = document.createElement("div");
        document.body.appendChild(this._console);
        this.input = ''
        // create a header div
        this._header = document.createElement("div");
        // create a body div
        this._body = document.createElement("div");
        this._console.appendChild(this._header);
        this._console.appendChild(this._body);
        this._setupCSS();
        this._title = "Spencer Archdeacon - Portfolio";
        this._header.innerHTML = this.title;
        const style = document.createElement("style");
        const keyframes = `@keyframes blink {
            0% {
                opacity: 0;
            }
            50% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }`;
        style.innerHTML = keyframes;
        document.head.appendChild(style);
        this.insertLine('type /help for a list of commands', false);
        this.insertLine('', true);
        this._body.addEventListener("click", () => {
            this._body.setAttribute("tabindex", "0");
            this._body.focus();
        });
        this._body.addEventListener("blur", () => {
            this._body.setAttribute("tabindex", "-1");
        });
        this._body.addEventListener("keydown", (event) => {
            const acceptableKeys = ["Enter", "Backspace", "Escape", 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ/ ', '1234567890', ' ' ]
            if (event.key === "Enter"){
                try{
                    document.querySelector(".cursor")?.remove();
                } catch (e) {
                    console.warn(e.message)
                }
                if(this._question){
                    this._question.cb(this.input);
                    return;
                }
                const event = new CustomEvent("command", {
                    detail: {
                        command: this.input.replaceAll('&nbsp;', ' ').trim()
                    }
                });
                const command = this.input.replaceAll('&nbsp;', ' ').replaceAll('/', '').trim().split(' ')[0];
                if (commands[command]){
                    commands[command].run(this);
                    this.dispatchEvent(event);
                } else {
                    if(this.input.length == 0 ) { 
                        this.insertLine('', true)
                        return;
                    }
                    this.insertLine(`'${command}' is an unknown command. try /help`, false);
                    this.insertLine('', true);
                }
                this.input = '';
                return;
            }
            if (event.key === "Backspace"){
                if (this.input.length === 0) return;
                if ( this.input.slice(-1) === ';' ){
                    this.input = this.input.slice(0, -6);
                }
                this.input = this.input.slice(0, -1);
            } else if (event.key === "Escape"){
                this.input = '';
            } else if (event.key == ' ') {
                this.input += '&nbsp;';
            } else if (acceptableKeys[3].includes(event.key) || acceptableKeys[4].includes(event.key)) {
                this.input += event.key;
            }
            this.updateInput();
        });
    }
    get title(){
        return this._title;
    }
    set title(value){
        this._title = value;
        this._header.innerHTML = this._title;
    }
    askQuestion(question, cb){
        this._requiresFeedback = true;
        this.insertLine(question, true);
        this._question = {question, cb};
    }
    connectedCallback(){
    }
    async insertLine( text = '', addCursor = true, addDirectory = true, bold = false){
        await sleep(200)
        const span = document.createElement("span");
        if(bold) span.style.fontWeight = "bold";
        const input = document.createElement("span");
        this.inputSpan = input;
        for(const command of Object.keys(commands)){
            if(text.includes('/'+command)){
                text = text.replace('/'+command, `<span class="command">/${command}</span>`);
            }
        }
        input.innerHTML = text;
        input.className = "currentInput";
        span.innerHTML = `<br/>${(addDirectory?'<span class="directory">C:\\Portfolio ></span> ':'&nbsp;&nbsp;')} `;
        span.appendChild(input);
        span.className = "input";
        this._body.appendChild(span);
        this.scroll();
        if(addCursor) span.appendChild(this._cursor());
    }
    _cursor(){
        const cursor = document.createElement("span");
        cursor.innerHTML = "_";
        cursor.className = "cursor";
        cursor.style.animation = "blink 1s infinite";
        return cursor;
    }
    animatedElipsis(){
        const elipsis = document.createElement("span");
        const elipese = ['.', '..', '...'];
        let i = 0;
        const timer = setInterval(() => {
            elipsis.innerHTML = elipese[i];
            i++;
            if (i > 2) i = 0;
        }, 500);

        elipsis.className = "elipsis";
        return {
            elipsis,
            stop: ()=>{
                clearInterval(timer);
                elipsis.innerHTML = ' ...Finished';
            },
        }
    }
    updateInput(){
        if(this._question){
            this.inputSpan.innerHTML = this._question.question + ' ' +this.input;
            // this.inputSpan.appendChild(this._cursor());
        } else {
            this.inputSpan.innerHTML = this.input;
        }
    }

    _setupCSS(){
        const fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.href = "https://fonts.googleapis.com/css?family=VT323&display=swap";
        document.head.appendChild(fontLink);
        document.head.appendChild(fontLink);

        const headerStyle = {
            backgroundColor: "black",
            color: "white",
            padding: "5px",
            fontWeight: "bold",
            fontSize: "clamp(15px, 2vw, 20px)",
            // borderBottom: "1px solid white",
            minWidth: "400px",
            borderTopLeftRadius: "5px",
            borderTopRightRadius: "5px",
        }
        const bodyStyle = {
            backgroundColor: "rgb(14, 14, 14)",
            padding: "5px",
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
            marginBottom: "5px",
            fontFamily: 'VT323, monospace',
            fontSize: "clamp(20px, 2vw, 30px)",
            minHeight: "200px",
            aspectRatio: "1/0.5",
            overflowY: "scroll",
            outline: "none",
        }

        for (const property in headerStyle) this._header.style[property] = headerStyle[property];
        
        for (const property in bodyStyle) this._body.style[property] = bodyStyle[property];
        
        // this._console.style.backgroundColor = "black";
        this._console.style.color = "white";
        this._console.style.width = "75%";
        // this._console.style.aspectRatio = "0.5/1";
        this._console.style.margin = "auto auto";
        this._console.style.boxShadow = "0px 0px 15px 0px black";
    }
    async insertText(text){
        // text = text.replaceAll(' ', '&nbsp;');
        for (let i = 1; i < text.length+1; i++){
            // debugger
            this.inputSpan.innerHTML = text.slice(0, i);
            this.scroll();
            await sleep(20);
        }
        for(const command of Object.keys(commands)){
            if(text.includes('/'+command)){
                text = text.replace('/'+command, `<span class="command">/${command}</span>`);
            }
        }
        this.inputSpan.innerHTML = text;
    }
    scroll(){
        this._body.scrollTop = this._body.scrollHeight;
    }
}
customElements.define("portfolio-console", Console);
async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}
const commands = {
    help: {
        description: "List of commands",
        run: async (c) => {
            c.insertLine(`You may execute a command by typing /command or simply the command without the forward-slash`, false, false);
            c.insertLine(``, false, false);
            for (const command in commands){
                c.insertLine(`/${command} - ${commands[command].description}`, false, false);
                await sleep(30)
            }
            c.insertLine('', true);
        }
    },
    'exit': {
        description: "Exit the console - See site as webpage",
        run: (c) => {
            c.remove();
        }
    },
    clear: {
        description: "Clear the console",
        run: (c) => {
            c.title = "Spencer Archdeacon - Portfolio";
            c._body.innerHTML = '';
            c.insertLine('', true);
        }
    },
    about: {
        description: "About me",
        run: async (c) => {
            c.title = "About Spencer Archdeacon";
            await c.insertLine('', false, false);
            await c.insertLine('--- Who Am I? ---', false, false, true);
            await c.insertLine('', false, false);
            await c.insertText(`I am a developer with over twenty years of experience in the field. I started my journey as a hobby programmer and discovered my passion for blockchain technology. I have been working hard to turn my hobby into a professional career.

            I have a strong background in JavaScript and TypeScript, as well as HTML/CSS. Additionally, I've built backend systems that relied on SQL databases and PHP.
            
            I am passionate about blockchain development and stay as up-to-date as I can with the state of the industry.
            
            I have experience in developing smart contracts, creating custom tokens, and deploying decentralized applications on the blockchain. I have honed my skills by working on personal projects.
            
            I am also well-versed in blockchain security best practices, and have experience implementing them in my projects to ensure the highest level of security for my clients.
            
            If you are looking for a skilled and passionate blockchain developer, please feel free to /email me or reach out on /linkedin. I am always open to discussing new projects and opportunities.`);
            await c.insertLine('', false, false);
            c.insertLine('', true);
        }
    },
    projects: {
        description: "List of projects",
        run: projects
    },
    resume: {
        description: "Download my resume",
        run: (c) => {
            c.insertLine('Not implemented yet.', false, false);
            c.insertLine('', true);
        }
    },
    skills: {
        description: "List of skills",
        run: async (c) => { 
            await c.insertLine('--- Skills ---', false, false);
            await c.insertLine('', false, false);
            await c.insertText('I have experience with the following technologies:');
            await c.insertLine('', false, false);
            await c.insertLine('Javascript - 15 years', false, false);
            await c.insertLine('PHP - 5 years', false, false);
            await c.insertLine('HTML - 15 years', false, false);
            await c.insertLine('CSS - 15 years', false, false);
            await c.insertLine('jQuery - 10 years', false, false);
            await c.insertLine('Svelte - 1 year', false, false);
            await c.insertLine('NodeJS - 5+ years', false, false);
            c.insertLine('', true);
        }
    },
    experience: {
        description: "List of experience",
        run: projects
    },
    github: {
        description: "Link to my github",
        run: async (c) => {
            c.insertLine('Fetching github...', false, false);
            await sleep(1250)
            c.insertLine('Finished. <a href="https://your-name-here.github.com" target="_new">My Github</a>', false, false);
            await sleep(400)
            c.insertLine('', true);
        }
    },
    linkedin: {
        description: "Link to my linkedin",
        run: async (c) => {
            c.insertLine('Fetching linkedin...', false, false);
            await sleep(1250)
            c.insertLine('Finished. <a href="https://www.linkedin.com/in/spencer-archdeacon-9a6207a0/">Visit LinkedIn</a>', false, false);
            await sleep(400)
            c.insertLine('', true);
        }
    },
    email: {
        description: "Contact me",
        run: async (c) => {
            c.insertLine('Fetching Email...', false, false);
            await sleep(1250)
            c.insertLine('<a href="mailto:archdeacon84@gmail.com">Email Me</a>', false, false);
            await sleep(400)
            c.insertLine('', true);
        }
    },
    party: {
        description: "You're invited!",
        run: async (c) => {
            c.title = "Party!"
            const elements = document.getElementsByClassName('directory');
            const spans = document.querySelectorAll('span:not(.directory)');
            for(const el of elements) {
                el.className += ' party';
                await sleep(Math.random() * 500)
                // debugger
            }
            for(const el of spans) {
                el.className += ' party';
                // await sleep(Math.random() * 500)
                // debugger
            }
            c.insertLine('/clear to stop partying', false );
            c.insertLine('', true);
        }
    }
}
async function projects(c){
    c.title = "Projects";
    const {elipsis, stop} = c.animatedElipsis();
    await c.insertLine('Running Program: Projects', false, false, true);
    await c.insertLine('', false, false);
    c.inputSpan.appendChild(elipsis);
    await c.insertLine('', false, false);
    await c.insertText('1. Lambot - A cyptocurrency trading bot');
    await c.insertLine('', false, false);
    await c.insertText('2. Lambot Website - Website responsible for selling the Lambot product');
    await c.insertLine('', false, false);
    await c.askQuestion('Enter a number to view the project: ', async (answer) => {
        c._question = null;
        if(answer == 1){
            await c.insertLine('Fetching project', false, false);
            await c.insertLine('', false, false);
            await c.insertLine('--- Lambot ---', false, false, true);
            await c.insertLine('', false, false);
            await c.insertText('Lambot is a cryptocurrency trading bot. It is a NodeJS application that uses exchange APIs to trade cryptocurrencies. It is a fully automated trading bot that can be configured to trade any cryptocurrency supported on the exchange. It is a NodeJS/Electron application that trades cryptocurrencies. It is a subscription based service that is self-hosted. It is a fully automated service that requires no user interaction passed the initial setup.');
            await c.insertLine('Technologies:', false, false);
            await sleep(1000)
            await c.insertLine(' NodeJS', false, false);
            await c.insertLine(' Electron', false, false);
            await c.insertLine(' Svelte (UI)', false, false);
            await c.insertLine(' Typescript', false, false);
            await c.insertLine(' PHP', false, false);
            await c.insertLine(' MYSQL', false, false);
            await c.insertLine(' Solidity - For on-chain payments', false, false);
            
            await c.insertLine('', true);
            c.title = "Spencer Archdeacon - Portfolio";
            stop();
        }
    });
}