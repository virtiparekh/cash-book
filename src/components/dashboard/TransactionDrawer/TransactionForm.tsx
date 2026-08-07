import Input from "../../common/Input/Input";
import Select from "../../common/Select/Select";
import TextArea from "../../common/TextArea/TextArea";
import Button from "../../common/Button/Button";
import Alert from "../../common/Alert/Alert";

type Option = {
  value: string;
  label: string;
};

type Props = {
  type: "cash-in" | "cash-out";

  amount: string;
  transactionDate: string;
  categoryId: string;
  paymentModeId: string;
  remarks: string;
  error: string;
  saving: boolean;

  categoryOptions: Option[];
  paymentModeOptions: Option[];

  onAmountChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onPaymentModeChange: (value: string) => void;
  onRemarksChange: (value: string) => void;

  onCancel: () => void;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>
  ) => void;
};

function TransactionForm({
  type,
  amount,
  transactionDate,
  categoryId,
  paymentModeId,
  remarks,
  error,
  saving,
  categoryOptions,
  paymentModeOptions,
  onAmountChange,
  onDateChange,
  onCategoryChange,
  onPaymentModeChange,
  onRemarksChange,
  onCancel,
  onSubmit,
}: Props) {
  return (
    <form
      className="drawer-form"
      onSubmit={onSubmit}
    >
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <Input
        label="Amount"
        type="number"
        required
        value={amount}
        placeholder="Enter amount"
        onChange={(event) =>
          onAmountChange(event.target.value)
        }
      />

      <Input
        label="Transaction Date"
        type="date"
        required
        value={transactionDate}
        onChange={(event) =>
          onDateChange(event.target.value)
        }
      />

      <Select
        label="Category"
        required
        value={categoryId}
        options={categoryOptions}
        onChange={(event) =>
          onCategoryChange(event.target.value)
        }
      />

      <Select
        label="Payment Mode"
        required
        value={paymentModeId}
        options={paymentModeOptions}
        onChange={(event) =>
          onPaymentModeChange(event.target.value)
        }
      />

      <TextArea
        label="Remarks"
        value={remarks}
        placeholder="Optional remarks"
        onChange={(event) =>
          onRemarksChange(event.target.value)
        }
      />

      <div className="drawer-footer">

        <Button
          type="button"
          variant="secondary"
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save"}
        </Button>

      </div>

    </form>
  );
}

export default TransactionForm;