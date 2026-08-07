import Button from "../../common/Button/Button";

import "./QuickActions.css";

type QuickActionsProps = {
  onCashIn: () => void;
  onCashOut: () => void;
};

function QuickActions({
  onCashIn,
  onCashOut,
}: QuickActionsProps) {
  return (
    <section className="quick-actions">

      <Button
        onClick={onCashIn}
        className="cashin-button"
      >
        + Cash In
      </Button>

      <Button
        onClick={onCashOut}
        className="cashout-button"
      >
        − Cash Out
      </Button>

    </section>
  );
}

export default QuickActions;