function CreateAccountModal({ onClose}) {
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Create Account</h2>
                //Lomake tähän
                <br />
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default CreateAccountModal;