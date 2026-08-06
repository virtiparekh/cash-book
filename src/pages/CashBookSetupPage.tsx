import { useState } from "react";

import "./../styles/CashBookSetupPage.css";
import {
  DEFAULT_CURRENCY,
  DEFAULT_OPENING_BALANCE,
} from "../constants/app";
import Card from "../components/common/Card/Card";
import Button from "../components/common/Button/Button";
import Input from "../components/common/Input/Input";
import NumberInput from "../components/common/NumberInput/NumberInput";
import Select from "../components/common/Select/Select";
import TextArea from "../components/common/TextArea/TextArea";
import PageHeader from "../components/common/PageHeader/PageHeader";
import { CURRENCY_OPTIONS } from "../constants/currencies";
import { loadMyCashBookGroups } from "../services/groupService";
import Alert from "../components/common/Alert/Alert";
import Loader from "../components/common/Loader/Loader";

import { createCashBookGroup }
  from "../services/cashBookService";

import { validateCashBook }
  from "../utils/cashBookValidation";

import { useCashBook }
  from "../hooks/useCashBook";


type CashBookSetupPageProps = {
  defaultOwnerName: string;
  onGroupCreated: (
    groupId: string
  ) => void;
};

function CashBookSetupPage({
  defaultOwnerName,
  onGroupCreated
}: CashBookSetupPageProps) {

  const [cashBookName, setCashBookName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [ownerName, setOwnerName] =
    useState(defaultOwnerName);

  const [currencyCode, setCurrencyCode] =
    useState(DEFAULT_CURRENCY)

  const [
    openingBalance,
    setOpeningBalance,
  ] = useState(DEFAULT_OPENING_BALANCE)

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const {
    setSelectedCashBook,
  } = useCashBook();

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {

    if (loading) {
      return;
    }

    event.preventDefault();

    setErrorMessage("");

    const validationError =
      validateCashBook(
        cashBookName,
        ownerName,
        openingBalance
      );

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {

      setLoading(true);

      const groupId =
        await createCashBookGroup({

          name: cashBookName.trim(),

          description: description.trim(),

          currencyCode,

          openingBalance,

          ownerName: ownerName.trim(),

        });

      const groups =
        await loadMyCashBookGroups();

      const createdGroup =
        groups.find(
          (group) => group.id === groupId
        );

      if (!createdGroup) {
        throw new Error(
          "Unable to load the newly created Cash Book."
        );
      }

      setSelectedCashBook(createdGroup);

      onGroupCreated(createdGroup.id);

    }

    catch (error: unknown) {

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create Cash Book.";

      setErrorMessage(message);

    }

    finally {

      setLoading(false);

    }

  };
  return (
    <main className="cashbook-setup-page">

      <div className="cashbook-setup-container">

        <Card className="cashbook-card">

          <PageHeader
            title="Create Your Family Cash Book"
            subtitle="Track income, expenses and balances together with your family."
          />

          {errorMessage && (
            <Alert variant="error">
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}
            autoComplete="off">

            <Input
              label="Cash Book Name"
              value={cashBookName}
              required={true}
              disabled={loading}
              placeholder="e.g. Parekh Family Cash Book"
              onChange={(event) => {
                setErrorMessage("");
                setCashBookName(event.target.value);
              }}
            />

            <TextArea
              label="Description"
              value={description}
              disabled={loading}
              placeholder="Optional description"
              onChange={(event) => {
                setErrorMessage("");
                setDescription(event.target.value);
              }}
            />

            <Input
              label="Owner Name"
              value={ownerName}
              disabled={loading}
              required={true}
              placeholder="Owner name"
              onChange={(event) => {
                setErrorMessage("");
                setOwnerName(event.target.value);
              }}
            />

            <Select
              label="Currency"
              disabled={loading}
              value={currencyCode}
              options={CURRENCY_OPTIONS}
              onChange={(event) => {
                setErrorMessage("");
                setCurrencyCode(event.target.value);
              }}
            />

            <NumberInput
              label="Opening Balance"
              disabled={loading}
              value={openingBalance}
              onChange={(value) => {
                setErrorMessage("");
                setOpeningBalance(value);
              }}
            />
            <p className="cashbook-help-text">
              You can keep this as 0 if you're starting fresh.
            </p>

            <div className="cashbook-actions">

              <Button
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <Loader
                    text="Creating Cash Book..."
                  />
                ) : (
                  "Create Cash Book"
                )}

              </Button>

            </div>

          </form>

        </Card>

      </div>

    </main>
  );
}

export default CashBookSetupPage;