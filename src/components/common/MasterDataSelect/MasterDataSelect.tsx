import {
  useEffect,
  useRef,
  useState,
} from "react";

import Button
  from "../Button/Button";

import Input
  from "../Input/Input";

import Popup
  from "../Popup/Popup";

import "./MasterDataSelect.css";


type Option = {
  value: string;
  label: string;
};


type Props = {

  label: string;

  value: string;

  options: Option[];

  placeholder?: string;

  disabled?: boolean;

  required?: boolean;

  addLabel: string;

  popupTitle: string;

  inputLabel: string;

  inputPlaceholder: string;

  onChange: (
    value: string
  ) => void;

  onCreate: (
    name: string
  ) => Promise<Option>;

};


function MasterDataSelect({

  label,

  value,

  options,

  placeholder =
    "Search or Select",

  disabled = false,

  required = false,

  addLabel,

  popupTitle,

  inputLabel,

  inputPlaceholder,

  onChange,

  onCreate,

}: Props) {


  const [
    open,
    setOpen,
  ] = useState(false);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    showCreatePopup,
    setShowCreatePopup,
  ] = useState(false);


  const [
    newName,
    setNewName,
  ] = useState("");


  const [
    creating,
    setCreating,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const containerRef =
    useRef<HTMLDivElement>(
      null
    );


  /*
   * Close dropdown when clicking
   * outside the component.
   */

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {

        setOpen(false);

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  const selectedOption =
    options.find(
      (option) =>
        option.value === value
    );


  const filteredOptions =
    options.filter(
      (option) =>
        option.label
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  function handleSelect(
    option: Option
  ) {

    onChange(
      option.value
    );

    setOpen(false);

    setSearch("");

  }


  function handleOpenCreate() {

    setOpen(false);

    setNewName("");

    setError("");

    setShowCreatePopup(true);

  }


  async function handleCreate() {

    const trimmedName =
      newName.trim();


    if (!trimmedName) {

      setError(
        `${inputLabel} cannot be empty.`
      );

      return;

    }


    try {

      setCreating(true);

      setError("");


      const created =
        await onCreate(
          trimmedName
        );


      /*
       * Automatically select
       * newly created option.
       */

      onChange(
        created.value
      );


      setShowCreatePopup(false);

      setNewName("");

    }

    catch (error) {

      setError(

        error instanceof Error
          ? error.message
          : `Unable to create ${inputLabel.toLowerCase()}.`

      );

    }

    finally {

      setCreating(false);

    }

  }


  return (

    <div
      className="master-data-field"
      ref={containerRef}
    >

      <label>

        {label}

        {required && (
          <span className="required-mark">
            *
          </span>
        )}

      </label>


      <div
        className={`master-data-select ${
          disabled
            ? "disabled"
            : ""
        }`}
      >

        <button
          type="button"
          className="master-data-select-trigger"
          disabled={disabled}
          onClick={() => {

            if (!disabled) {

              setOpen(
                !open
              );

            }

          }}
        >

          <span
            className={
              selectedOption
                ? "selected-value"
                : "placeholder-value"
            }
          >

            {selectedOption?.label ??
              placeholder}

          </span>


          <span className="select-arrow">

            ▾

          </span>

        </button>


        <button
          type="button"
          className="master-data-settings"
          disabled={disabled}
          title={addLabel}
          onClick={
            handleOpenCreate
          }
        >

          ⚙

        </button>


        {open && (

          <div
            className="master-data-dropdown"
          >

            <div
              className="master-data-search"
            >

              <input
                type="text"
                value={search}
                placeholder={
                  placeholder
                }
                autoFocus
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>


            <div
              className="master-data-options"
            >

              {filteredOptions.length >
              0 ? (

                <>

                  <div
                    className="master-data-section-title"
                  >

                    In This Book

                  </div>


                  {filteredOptions.map(
                    (option) => (

                      <button
                        key={
                          option.value
                        }
                        type="button"
                        className={
                          `master-data-option ${
                            option.value ===
                            value
                              ? "selected"
                              : ""
                          }`
                        }
                        onClick={() =>
                          handleSelect(
                            option
                          )
                        }
                      >

                        <span
                          className="radio-circle"
                        >

                          {option.value ===
                            value && (
                            <span />
                          )}

                        </span>


                        <span>

                          {
                            option.label
                          }

                        </span>

                      </button>

                    )
                  )}

                </>

              ) : (

                <div
                  className="master-data-empty"
                >

                  No matching items.

                </div>

              )}

            </div>


            <button
              type="button"
              className="master-data-add"
              onClick={
                handleOpenCreate
              }
            >

              <span>

                +

              </span>

              {addLabel}

            </button>

          </div>

        )}

      </div>


      {showCreatePopup && (

        <Popup
          variant="info"
          title={popupTitle}
          onClose={() => {

            if (!creating) {

              setShowCreatePopup(
                false
              );

            }

          }}
        >

          <div
            className="master-data-popup"
          >

            <Input
              label={inputLabel}
              value={newName}
              placeholder={
                inputPlaceholder
              }
              disabled={creating}
              autoComplete="off"
              onChange={(event) => {

                setNewName(
                  event.target.value
                );

                setError("");

              }}
            />


            {error && (

              <p
                className="master-data-popup-error"
              >

                {error}

              </p>

            )}


            <div
              className="master-data-popup-actions"
            >

              <Button
                type="button"
                variant="secondary"
                disabled={creating}
                onClick={() =>
                  setShowCreatePopup(
                    false
                  )
                }
              >

                Cancel

              </Button>


              <Button
                type="button"
                disabled={
                  creating
                }
                onClick={() => {
                  void handleCreate();
                }}
              >

                {creating
                  ? "Saving..."
                  : "Save"}

              </Button>

            </div>

          </div>

        </Popup>

      )}

    </div>

  );

}


export default MasterDataSelect;