// Project state Management

class ProjectState {
    private projects: any[] = [];
    private listeners: any[] = [];

    private static instance: ProjectState;

    private constructor(){

    }

    static getInstance(){
        if(this.instance){
            return this.instance
        }
        this.instance = new ProjectState();
        return this.instance
    }

    addListener(listenerFn: Function){
        this.listeners.push(listenerFn)
    }
    addProject(title: string, description: string, numOfPeople: number){
        const newProject = {
            id: Math.random().toString(),
            title,
            description,
            people: numOfPeople
        }
        this.projects.push(newProject)
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice())
        }
    }
}

const projectState = ProjectState.getInstance();



//autobind decorator
const autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor;
}

// Validation interface

interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number
}

// Validation function
const validate = (validatableInput: Validatable) => {
    let isValid = true;

    if(validatableInput.required){
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }

    if(validatableInput.minLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength
    }

    if(validatableInput.maxLength != null && typeof validatableInput.value === 'string'){
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength
    }

    if(validatableInput.max != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value <= validatableInput.max
    }

    if(validatableInput.min != null && typeof validatableInput.value === 'number'){
        isValid = isValid && validatableInput.value >= validatableInput.min
    }

    return isValid;

}

// Project list class

class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: any[];

   constructor(private type: 'active' | 'finished'){
         this.templateElement = <HTMLTemplateElement>document.getElementById('project-list')!;
         this.hostElement = <HTMLDivElement> document.getElementById('app')!;
         this.assignedProjects = []

         const importedNode = document.importNode(this.templateElement.content, true)
         this.element = <HTMLElement>importedNode.firstElementChild
         this.element.id = `${this.type}-projects`

         projectState.addListener((projects: any[]) => {
             this.assignedProjects = projects;
             this.renderProjects()
         })

         this.attach()
         this.renderContent()
   }


   private attach(){
       this.hostElement.insertAdjacentElement('beforeend', this.element);

   }

   private renderContent(){
       const listId = `${this.type}-projects-list`
       this.element.querySelector('ul')!.id = listId;

       this.element.querySelector("h2")!.textContent = this.type.toUpperCase() + ' PROJECTS'
   }

    private renderProjects(){
       const listElement = <HTMLUListElement>document.getElementById(`${this.type}-projects-list`)!;

         for(const prjItem of this.assignedProjects){
             const listItem = document.createElement('li');
             listItem.textContent = prjItem.title;
             listElement.appendChild(listItem)
         }
    }
}


class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;


    constructor() {
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = <HTMLDivElement> document.getElementById('app')!;

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = <HTMLFormElement>importedNode.firstElementChild
        this.element.id = "user-input"

        this.titleInputElement = <HTMLInputElement>this.element.querySelector('#title')
        this.descriptionInputElement = <HTMLInputElement>this.element.querySelector('#description')
        this.peopleInputElement = <HTMLInputElement>this.element.querySelector('#people')


        this.configure()
        this.attach()
    }

    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }

    @autobind
    private submitHandler(event: Event){
        event.preventDefault();
        const userInput = this.getUserInput();
        if(Array.isArray(userInput)){
            const [title, desc, people] = userInput;
            projectState.addProject(title, desc, people)
            this.clearInputs()
        }

    }

    private configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidatable: Validatable = {
            value: enteredTitle,
            required: true
        }

        const descriptionValidatable: Validatable = {
            value: enteredDescription,
            required: true,
            minLength: 5
        }

        const peopleValidatable: Validatable = {
            value: +enteredPeople,
            required: true,
            min: 1,
            max: 4
        }

        if(!validate(titleValidatable) || !validate(descriptionValidatable) || !validate(peopleValidatable)){
            alert('Invalid input, please try again')
            return;
        }else{
            return [enteredTitle, enteredDescription, +enteredPeople]
        }


    }

    private clearInputs(){
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }


}



const prjInput = new ProjectInput();
const activePrjList = new ProjectList('active')
const finishedPrjList = new ProjectList('finished')