function BootstrapModal({ id, title, body, onClosed }) {
    React.useEffect(() => {
        const modalEl = document.getElementById(id);
        if (!modalEl) return;
        
        // 正確使用 bootstrap.Modal 大小寫規範
        const modalInstance = new bootstrap.Modal(modalEl);
        modalInstance.show();

        const timer = setTimeout(() => {
            modalInstance.hide();
            if (onClosed) onClosed();
        }, 3000);

        modalEl.addEventListener('hidden.bs.modal', function () {
            if (onClosed) onClosed();
        });

        return () => {
            clearTimeout(timer);
            modalInstance.dispose();
        };
    }, [id, body]);

    return (
        <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        {body}
                    </div>
                </div>
            </div>
        </div>
    );
}
window.BootstrapModal = BootstrapModal;