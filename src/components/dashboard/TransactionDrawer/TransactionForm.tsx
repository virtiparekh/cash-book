import {
  useEffect,
  useState,
} from "react";

import Input
  from "../../common/Input/Input";

import MasterDataSelect from "../../common/MasterDataSelect/MasterDataSelect";

import TextArea
  from "../../common/TextArea/TextArea";

import Button
  from "../../common/Button/Button";

import Popup
  from "../../common/Popup/Popup";


type Option = {
  value: string;
  label: string;
};


type Props = {

  type:
  | "cash-in"
  | "cash-out";

  selectedType:
  | "cash-in"
  | "cash-out";

  onTypeChange:
  (type: "cash-in" | "cash-out") => void;

  amount: string;

  transactionDate: string;

  categoryId: string;

  paymentModeId: string;

  remarks: string;

  error: string;

  saving: boolean;

  categoryOptions: Option[];

  paymentModeOptions: Option[];

  onAmountChange:
  (value: string) => void;

  onDateChange:
  (value: string) => void;

  onCategoryChange:
  (value: string) => void;

  onPaymentModeChange:
  (value: string) => void;

  onRemarksChange:
  (value: string) => void;

  onCancel: () => void;

  onSubmit:
  (event: React.FormEvent) => void;

  onCreateCategory:
  (name: string) => Promise<Option>;

  onCreatePaymentMode:
  (name: string) => Promise<Option>;
};


function TransactionForm({

  selectedType,

  onTypeChange,

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

  onCreateCategory,
  onCreatePaymentMode

}: Props) {


  /*
   * -------------------------------------------------
   * Popup
   * -------------------------------------------------
   */

  const [
    showPopup,
    setShowPopup,
  ] = useState(false);


  /*
   * -------------------------------------------------
   * Show popup whenever parent sends an error
   * -------------------------------------------------
   */

  useEffect(() => {

    if (error) {

      setShowPopup(true);

    }

  }, [
    error,
  ]);


  /*
   * -------------------------------------------------
   * Close popup
   * -------------------------------------------------
   */

  const handleClosePopup =
    () => {

      setShowPopup(false);

    };


  return (

    <form
      className="drawer-form"
      onSubmit={onSubmit}
    >


      {/* -------------------------------------------------
          Transaction Error Popup
         ------------------------------------------------- */}

      {showPopup && error && (

        <Popup
          variant="error"
          title="Transaction Error"
          onClose={
            handleClosePopup
          }
        >

          {error}

        </Popup>

      )}


      <div className="drawer-form-content">
        <div className="transaction-type-switch">

          <button
            type="button"
            className={
              selectedType === "cash-in"
                ? "transaction-type-btn cash-in active"
                : "transaction-type-btn cash-in"
            }
            disabled={saving}
            onClick={() =>
              onTypeChange("cash-in")
            }
          >
            Cash In
          </button>

          <button
            type="button"
            className={
              selectedType === "cash-out"
                ? "transaction-type-btn cash-out active"
                : "transaction-type-btn cash-out"
            }
            disabled={saving}
            onClick={() =>
              onTypeChange("cash-out")
            }
          >
            Cash Out
          </button>

        </div>

        <Input

          label="Amount"

          type="number"

          required

          value={amount}

          placeholder="Enter amount"

          disabled={saving}

          onChange={(event) =>
            onAmountChange(
              event.target.value
            )
          }

        />


        <Input

          label="Transaction Date"

          type="date"

          required

          value={
            transactionDate
          }

          disabled={saving}

          onChange={(event) =>
            onDateChange(
              event.target.value
            )
          }

        />


        <MasterDataSelect

          label="Category"

          value={categoryId}

          options={categoryOptions}

          placeholder="Search or Select"

          disabled={saving}

          required

          addLabel="Add New Category"

          popupTitle="Add New Category"

          inputLabel="Category Name"

          inputPlaceholder="e.g. Grocery, Medical, Education"

          onChange={
            onCategoryChange
          }

          onCreate={
            onCreateCategory
          }

        />


        <MasterDataSelect

          label="Payment Mode"

          value={paymentModeId}

          options={paymentModeOptions}

          placeholder="Search or Select"

          disabled={saving}

          required

          addLabel="Add New Payment Mode"

          popupTitle="Add New Payment Mode"

          inputLabel="Payment Mode Name"

          inputPlaceholder="e.g. Net Banking, Credit Card"

          onChange={
            onPaymentModeChange
          }

          onCreate={
            onCreatePaymentMode
          }

        />


        <TextArea

          label="Remarks"

          value={remarks}

          placeholder="Optional remarks"

          disabled={saving}

          onChange={(event) =>
            onRemarksChange(
              event.target.value
            )
          }

        />

      </div>


      <div
        className="drawer-footer"
      >


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