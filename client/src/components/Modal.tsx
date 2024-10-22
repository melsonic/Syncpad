function Modal(props: any) {
  const { displayModal, children, x, y, closeModal } = props;
  if (!displayModal) return;
  let showModalInMiddle: boolean = (x === 0) && (y === 0);
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
        }}
        className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30"
        onClick={closeModal}
      >
      </div>
      <div
        style={showModalInMiddle
          ? {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 100,
          }
          : {
            position: "fixed",
            left: x,
            right: y,
            zIndex: 100,
          }}
      >
        {children}
      </div>
    </>
  );
}

export default Modal;
