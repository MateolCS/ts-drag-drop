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
            console.log(title, desc, people)
        }
        this.clearInputs()
    }

    private configure(){
        this.element.addEventListener('submit', this.submitHandler)
    }

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        if(enteredTitle.trim().length == 0 || enteredDescription.trim().length == 0 || enteredPeople.trim().length == 0){
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