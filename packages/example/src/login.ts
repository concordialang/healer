import accounts from './accounts.json';

const container: HTMLDivElement = document.querySelector( '.container' );
const form: HTMLFormElement = document.querySelector( '#form' );
const username: HTMLInputElement = document.querySelector( '#username' );
const password: HTMLInputElement = document.querySelector( '#password' );

const createAlert = ( message: string ): void => {
    container.insertAdjacentHTML(
        'afterbegin',
        `<div class="alert alert-danger text-center" role="alert">${message}</div>`,
    );
};

const clearAlert = (): void => {
    const alert = container.querySelector( '.alert' );

    if ( alert ) {
        alert.remove();
    }
};

const submit = (): void => {
    const account = accounts.find(
        ( value ) => value.username === username.value && value.password === password.value,
    );

    clearAlert();

    if ( !account ) {
        createAlert( 'Username or password incorrect!' );

        return;
    }

    window.location.href = '/welcome.html';
};

form.addEventListener( 'submit', ( event ) => {
    event.preventDefault();
    if ( !form.checkValidity() ) {
        form.classList.add( 'was-validated' );

        return;
    }
    submit();
} );
