import React, { useState } from "react";
import { Button } from "react-bootstrap";

const ScrennShotButton = ({ enabled, onClick }) => {
  const [started, setStarted] = useState(false);

  return (
    <Button
      variant={started ? "danger" : "success"}
      onClick={(e) => {
        setStarted(!started);
        onClick(e);
      }}
      disabled={!enabled}
      size="sm"
    >
      {started ? "Stop" : "Start"} Screenshot
    </Button>
  );
};

export default ScrennShotButton;
