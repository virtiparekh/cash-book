import { useState } from "react";

import "./../styles/CashBookSetupPage.css";

import {
  DEFAULT_CURRENCY,
  DEFAULT_OPENING_BALANCE,
} from "../constants/app";

import Card
  from "../components/common/Card/Card";

import Button
  from "../components/common/Button/Button";

import Input
  from "../components/common/Input/Input";

import NumberInput
  from "../components/common/NumberInput/NumberInput";

import Select
  from "../components/common/Select/Select";

import TextArea
  from "../components/common/TextArea/TextArea";

import PageHeader
  from "../components/common/PageHeader/PageHeader";

import Popup
  from "../components/common/Popup/Popup";

import Loader
  from "../components/common/Loader/Loader";

import { CURRENCY_OPTIONS }
  from "../constants/currencies";

import {
  loadMyCashBookGroups,
} from "../services/groupService";

import {
  createCashBookGroup,
} from "../services/cashBookService";

import {
  validateCashBook,
} from "../utils/cashBookValidation";

import {
  useCashBook,
} from "../hooks/useCashBook";

import {
  useAuth,
} from "../contexts/AuthContext";


type CashBookSetupPageProps = {
  defaultOwnerName: string;

  onGroupCreated: (
    groupId: string
  ) => void;
};


function CashBookSetupPage({
  defaultOwnerName,
  onGroupCreated,
}: CashBookSetupPageProps) {

  /*
   * -------------------------------------------------
   * Form State
   * -------------------------------------------------
   */

  const [
    cashBookName,
    setCashBookName,
  ] = useState("");


  const [
    description,
    setDescription,
  ] = useState("");


  const [
    ownerName,
    setOwnerName,
  ] = useState(
    defaultOwnerName
  );


  const [
    currencyCode,
    setCurrencyCode,
  ] = useState(
    DEFAULT_CURRENCY
  );


  const [
    openingBalance,
    setOpeningBalance,
  ] = useState(
    DEFAULT_OPENING_BALANCE
  );


  /*
   * -------------------------------------------------
   * Loading State
   * -------------------------------------------------
   */

  const [
    loading,
    setLoading,
  ] = useState(false);


  /*
   * -------------------------------------------------
   * Popup State
   * -------------------------------------------------
   */

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");


  const [
    showPopup,
    setShowPopup,
  ] = useState(false);


  /*
   * -------------------------------------------------
   * Cash Book Context
   * -------------------------------------------------
   */

  const {
    setSelectedCashBook,
  } = useCashBook();


  /*
   * -------------------------------------------------
   * Authentication
   * -------------------------------------------------
   */

  const {
    signOut,
  } = useAuth();


  /*
   * -------------------------------------------------
   * Close Popup
   * -------------------------------------------------
   */

  const handleClosePopup = () => {

    setShowPopup(false);

    setErrorMessage("");

  };


  /*
   * -------------------------------------------------
   * Submit
   * -------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {

    if (loading) {
      return;
    }


    event.preventDefault();


    setErrorMessage("");
    setShowPopup(false);


    /*
     * -------------------------------------------------
     * Validation
     * -------------------------------------------------
     */

    const validationError =
      validateCashBook(
        cashBookName,
        ownerName,
        openingBalance
      );


    if (validationError) {

      setErrorMessage(
        validationError
      );

      setShowPopup(true);

      return;

    }


    /*
     * -------------------------------------------------
     * Create Cash Book
     * -------------------------------------------------
     */

    try {

      setLoading(true);


      const groupId =
        await createCashBookGroup({

          name:
            cashBookName.trim(),

          description:
            description.trim(),

          currencyCode,

          openingBalance,

          ownerName:
            ownerName.trim(),

        });


      /*
       * -------------------------------------------------
       * Reload Cash Book Groups
       * -------------------------------------------------
       */

      const groups =
        await loadMyCashBookGroups();


      /*
       * -------------------------------------------------
       * Find Newly Created Group
       * -------------------------------------------------
       */

      const createdGroup =
        groups.find(
          (group) =>
            group.id === groupId
        );


      if (!createdGroup) {

        throw new Error(
          "Unable to load the newly created Cash Book."
        );

      }


      /*
       * -------------------------------------------------
       * Select Created Cash Book
       * -------------------------------------------------
       */

      setSelectedCashBook(
        createdGroup
      );


      /*
       * -------------------------------------------------
       * Notify Parent
       * -------------------------------------------------
       */

      onGroupCreated(
        createdGroup.id
      );

    }

    catch (error: unknown) {

      const message =
        error instanceof Error
          ? error.message
          : "Unable to create Cash Book.";


      setErrorMessage(
        message
      );


      setShowPopup(
        true
      );

    }

    finally {

      setLoading(false);

    }

  };


  /*
   * -------------------------------------------------
   * Render
   * -------------------------------------------------
   */

  return (

    <main className="cashbook-setup-page">


      {/* -------------------------------------------------
          Error Popup
         ------------------------------------------------- */}

      {showPopup && (

        <Popup
          variant="error"
          title="Cash Book Setup Error"
          onClose={
            handleClosePopup
          }
        >

          {errorMessage}

        </Popup>

      )}


      <div className="cashbook-setup-container">


        <Card className="cashbook-card">


          {/* -------------------------------------------------
              Header
             ------------------------------------------------- */}

          <div className="cashbook-setup-header">


            <PageHeader
              title="Create Your Family Cash Book"
              subtitle="Track income, expenses and balances together with your family."
            />


            <Button
              variant="secondary"
              type="button"
              disabled={loading}
              onClick={() => {
                void signOut();
              }}
            >

              Logout

            </Button>


          </div>


          {/* -------------------------------------------------
              Form
             ------------------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            autoComplete="off"
          >


            {/* -------------------------------------------------
                Cash Book Name
               ------------------------------------------------- */}

            <Input
              label="Cash Book Name"
              value={cashBookName}
              required={true}
              disabled={loading}
              placeholder="e.g. Parekh Family Cash Book"
              onChange={(event) => {

                setErrorMessage("");

                setCashBookName(
                  event.target.value
                );

              }}
            />


            {/* -------------------------------------------------
                Description
               ------------------------------------------------- */}

            <TextArea
              label="Description"
              value={description}
              disabled={loading}
              placeholder="Optional description"
              onChange={(event) => {

                setErrorMessage("");

                setDescription(
                  event.target.value
                );

              }}
            />


            {/* -------------------------------------------------
                Owner Name
               ------------------------------------------------- */}

            <Input
              label="Owner Name"
              value={ownerName}
              disabled={loading}
              required={true}
              placeholder="Owner name"
              onChange={(event) => {

                setErrorMessage("");

                setOwnerName(
                  event.target.value
                );

              }}
            />


            {/* -------------------------------------------------
                Currency
               ------------------------------------------------- */}

            <Select
              label="Currency"
              disabled={loading}
              value={currencyCode}
              options={CURRENCY_OPTIONS}
              onChange={(event) => {

                setErrorMessage("");

                setCurrencyCode(
                  event.target.value
                );

              }}
            />


            {/* -------------------------------------------------
                Opening Balance
               ------------------------------------------------- */}

            <NumberInput
              label="Opening Balance"
              disabled={loading}
              value={openingBalance}
              onChange={(value) => {

                setErrorMessage("");

                setOpeningBalance(
                  value
                );

              }}
            />


            <p className="cashbook-help-text">

              You can keep this as 0 if you're starting fresh.

            </p>


            {/* -------------------------------------------------
                Actions
               ------------------------------------------------- */}

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