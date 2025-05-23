import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import _ from "lodash";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import {
  Input,
  Select,
  defaultBorderRadius,
  lightGray,
  vscBackground,
} from "../../components";
import StyledMarkdownPreview from "../../components/markdown/StyledMarkdownPreview";
import ModelCard from "../../components/modelSelection/ModelCard";
import ModelProviderTag from "../../components/modelSelection/ModelProviderTag";
import Toggle from "../../components/modelSelection/Toggle";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { useNavigationListener } from "../../hooks/useNavigationListener";
import { setDefaultModel } from "../../redux/slices/stateSlice";
import { updatedObj } from "../../util";
import type { ProviderInfo } from "./configs/providers";
import { providers } from "./configs/providers";
import "@/continue-styles.css";

const GridDiv = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 2rem;
  padding: 1rem;
  justify-items: center;
  align-items: center;
`;

export const CustomModelButton = styled.div<{ disabled: boolean }>`
  border: 1px solid ${lightGray};
  border-radius: ${defaultBorderRadius};
  padding: 4px 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s;

  ${(props) =>
    props.disabled
      ? `
    opacity: 0.5;
    `
      : `
  &:hover {
    border: 1px solid #be1b55;
    background-color: #be1b5522;
    cursor: pointer;
  }
  `}
`;

const ErrorText = styled.div`
    color: #dc2626;
    font-size: 14px;
    margin-top: 8px;
`;

function ConfigureProvider() {
  useNavigationListener();
  const formMethods = useForm();
  const { providerName } = useParams();
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [modelInfo, setModelInfo] = useState<ProviderInfo | undefined>(
    undefined,
  );

  //  different authentication flow is required for watsonx. This state helps to determine which flow to use for authentication
  const [watsonxAuthenticate, setWatsonxAuthenticate] = React.useState(true);

  const { watch, handleSubmit } = formMethods;

  useEffect(() => {
    if (providerName) {
      setModelInfo(providers[providerName]);
    }
  }, [providerName]);

  // TODO: This is not being used - do we still need this?
  const handleContinue = () => {
    if (!modelInfo) return;

    let formParams: any = {};
    for (const d of modelInfo.collectInputFor || []) {
      const val = formMethods.watch(d.key);
      if (val === "" || val === undefined || val === null) continue;
      formParams = updatedObj(formParams, {
        [d.key]: d.inputType === "text" ? val : parseFloat(val),
      });
    }
    const model = {
      ...formParams,
      provider: modelInfo.provider,
    };
    ideMessenger.post("config/addModel", { model });
    dispatch(setDefaultModel({ title: model.title, force: true }));
    navigate("/");
  };

  const disableModelCards = useCallback(() => {
    return (
      modelInfo?.collectInputFor?.some((d) => {
        if (!d.required) return false;
        const val = formMethods.watch(d.key);
        return (
          typeof val === "undefined" || (typeof val === "string" && val === "")
        );
      }) || false
    );
  }, [modelInfo, formMethods]);

  const enablecardsForApikey = useCallback(() => {
    return modelInfo?.collectInputFor
      ?.filter((d) => d.isWatsonxAuthenticatedByApiKey)
      .some((d) => !formMethods.watch(d.key));
  }, [modelInfo, formMethods]);
  const enablecardsForCredentials = useCallback(() => {
    return modelInfo?.collectInputFor
      ?.filter((d) => d.isWatsonxAuthenticatedByCredentials)
      .some((d) => !formMethods.watch(d.key));
  }, [modelInfo, formMethods]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleOpenRouterSubmit = () => {
    const formValues = formMethods.getValues();
    const model = formValues.model;
    const apiKey = formValues.apiKey;

    if (!formValues.apiKey) {
      setErrorMessage("Please enter your OpenRouter API key");
      return;
    }

    if (!formValues.model) {
      setErrorMessage("Please select a model");
      return;
    }

    handleSubmit((data) => {
      const selectedPackage = providers.openrouter?.packages.find(
        (pkg) => pkg.params.model === model,
      );

      let formParams: any = {};

      for (const d of providers.openrouter?.collectInputFor || []) {
        const val = data[d.key];

        if (val === "" || val === undefined || val === null) {
          continue;
        }

        formParams = updatedObj(formParams, {
          [d.key]: d.inputType === "text" ? val : parseFloat(val),
        });
      }

      const modelConfig = {
        ...selectedPackage.params,
        ...providers.openrouter?.params,
        ...formParams,
        apiKey,
        model,
        provider: "openrouter",
        title:
          `${selectedPackage.title} (OpenRouter)` || `${model} (OpenRouter)`,
      };

      ideMessenger.post("config/addModel", { model: modelConfig });

      dispatch(
        setDefaultModel({
          title: modelConfig.title,
          force: true,
        }),
      );
      navigate("/");
    })();
  };

  return (
    <FormProvider {...formMethods}>
      <div className="overflow-y-scroll">
        <div
          className="items-center flex m-0 p-0 sticky top-0"
          style={{
            borderBottom: `0.5px solid ${lightGray}`,
            backgroundColor: vscBackground,
            zIndex: 2,
          }}
        >
          <ArrowLeftIcon
            width="1.2em"
            height="1.2em"
            onClick={() => navigate("/addModel")}
            className="inline-block ml-4 cursor-pointer"
          />
          <h3 className="text-lg font-bold m-2 inline-block">
            Configure Provider
          </h3>
        </div>

        <div className="px-2">
          <div style={{ display: "flex", alignItems: "center" }}>
            {window.vscMediaUrl && modelInfo?.icon && (
              <img
                src={`${window.vscMediaUrl}/logos/${modelInfo?.icon}`}
                height="24px"
                style={{ marginRight: "10px" }}
              />
            )}
            <h2>{modelInfo?.title}</h2>
          </div>

          {modelInfo?.tags?.map((tag, i) => (
            <ModelProviderTag key={i} tag={tag} />
          ))}

          <StyledMarkdownPreview
            className="mt-2"
            source={modelInfo?.longDescription || modelInfo?.description}
          />

          {/* The WatsonX Authentication coukd be done by two different ways
           1 ==> Using Api key
           2 ==> Using Credentials */}
          {providerName === "watsonx" ? (
            <>
              <div className="col-span-full py-4">
                <Toggle
                  selected={watsonxAuthenticate}
                  optionOne={"Authenticate by API key"}
                  optionTwo={"Authenticate by crendentials"}
                  onClick={() => {
                    setWatsonxAuthenticate((prev) => !prev);
                  }}
                ></Toggle>
              </div>
              {watsonxAuthenticate ? (
                <>
                  {(modelInfo?.collectInputFor?.filter((d) => d.required)
                    .length || 0) > 0 && (
                    <>
                      <h3 className="mb-2">Enter required parameters</h3>

                      {modelInfo?.collectInputFor
                        .filter((d) => d.isWatsonxAuthenticatedByApiKey)
                        .map((d, idx) => (
                          <div key={idx} className="mb-2">
                            <label htmlFor={d.key}>{d.label}</label>
                            <Input
                              type={d.inputType}
                              id={d.key}
                              className="border-2 border-gray-200 rounded-md p-2 m-2"
                              placeholder={d.placeholder}
                              defaultValue={d.defaultValue}
                              min={d.min}
                              max={d.max}
                              step={d.step}
                              {...formMethods.register(d.key, {
                                required: false,
                              })}
                            />
                          </div>
                        ))}
                    </>
                  )}
                </>
              ) : (
                <>
                  {(modelInfo?.collectInputFor?.filter((d) => d.required)
                    .length || 0) > 0 && (
                    <>
                      <h3 className="mb-2">Enter required parameters</h3>

                      {modelInfo?.collectInputFor
                        .filter((d) => d.isWatsonxAuthenticatedByCredentials)
                        .map((d, idx) => (
                          <div key={idx} className="mb-2">
                            <label htmlFor={d.key}>{d.label}</label>
                            <Input
                              type={d.inputType}
                              id={d.key}
                              className="border-2 border-gray-200 rounded-md p-2 m-2"
                              placeholder={d.placeholder}
                              defaultValue={d.defaultValue}
                              min={d.min}
                              max={d.max}
                              step={d.step}
                              {...formMethods.register(d.key, {
                                required: true,
                              })}
                            />
                          </div>
                        ))}
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {(modelInfo?.collectInputFor?.filter((d) => d.required).length ||
                0) > 0 && (
                <>
                  <h3 className="mb-2">Enter required parameters</h3>

                  {modelInfo?.collectInputFor
                    ?.filter((d) => d.required)
                    .map((d, idx) => (
                      <div key={idx} className="mb-2">
                        <label htmlFor={d.key}>{d.label}</label>
                        <Input
                          type={d.inputType}
                          id={d.key}
                          className="border-2 border-gray-200 rounded-md p-2 m-2"
                          placeholder={d.placeholder}
                          defaultValue={d.defaultValue}
                          min={d.min}
                          max={d.max}
                          step={d.step}
                          {...formMethods.register(d.key, {
                            required: true,
                          })}
                        />
                      </div>
                    ))}
                </>
              )}
            </>
          )}

          {(modelInfo?.collectInputFor?.filter((d) => !d.required).length ||
            0) > 0 && (
            <details>
              <summary className="mb-2 cursor-pointer">
                <b>Advanced (optional)</b>
              </summary>
              {modelInfo?.collectInputFor?.map((d, idx) => {
                // Check the attribute is only for Watson X
                if (d.isWatsonxAttribute) return null;
                if (d.required) return null;

                let defaultValue = d.defaultValue;

                if (
                  providerName === "openrouter" &&
                  d.key === "contextLength"
                ) {
                  const selectedPackage = providers[
                    "openrouter"
                  ]?.packages.find(
                    (pkg) => pkg.params.model === watch("model"),
                  );
                  defaultValue = selectedPackage?.params.contextLength;
                }

                return (
                  <div key={idx}>
                    <label htmlFor={d.key}>{d.label}</label>
                    <Input
                      type={d.inputType}
                      id={d.key}
                      className="border-2 border-gray-200 rounded-md p-2 m-2"
                      placeholder={d.placeholder}
                      defaultValue={defaultValue}
                      min={d.min}
                      max={d.max}
                      step={d.step}
                      {...formMethods.register(d.key, {
                        required: false,
                      })}
                    />
                  </div>
                );
              })}
            </details>
          )}
          {providerName === "openrouter" && (
            <div className="mb-2">
              <label htmlFor="model">Select a Model</label>
              <Select
                id="model"
                className="border-2 border-gray-200 rounded-md p-2 m-2 w-full"
                {...formMethods.register("model", { required: true })}
              >
                <option value="">Select a model</option>
                {providers.openrouter?.packages.map((pkg) => (
                  <option key={pkg.params.model} value={pkg.params.model}>
                    {pkg.title}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {providerName === "openrouter" && (
            <>
              {errorMessage && (
                <ErrorText>
                  {errorMessage}
                </ErrorText>
              )}
              <CustomModelButton
                className={`mt-4 font-bold py-2 px-4 h-8`}
                onClick={handleOpenRouterSubmit}
                disabled={false}
              >
                Add OpenRouter Model
              </CustomModelButton>
            </>
          )}
        {providerName === "pearai_server" ? (
            <>

                <CustomModelButton
                  className="m-5"
                  disabled={false}
                  onClick={() =>
                    ideMessenger.post(
                      "openUrl",
                      "https://trypear.ai/signin?callback=pearai://pearai.pearai/auth", // Change to http://localhost:3000 and run pear-landing-page repo to test locally
                    )
                  }
                >
                  <h3 className="text-center my-2">Sign Up / Log In</h3>
                  <img
                    src={`${window.vscMediaUrl}/logos/${modelInfo?.icon}`}
                    height="24px"
                    style={{ marginRight: "5px" }}
                  />
                </CustomModelButton>
                <p style={{ color: lightGray }} className="mx-3">
                  After login, the website should redirect you back here.
                </p>
                <small
                  style={{
                    color: lightGray,
                    fontSize: '0.85em',
                    display: 'block'
                  }}
                  className="mx-3"
                >
                  Note: Having trouble logging in? Open PearAI from the dashboard on the {' '}
                  <a href="https://trypear.ai/dashboard" target="_blank" rel="noopener noreferrer">
                    website
                  </a>.
                  </small>
            </>
            ) : (
              providerName !== "openrouter" && (
                <>
                <h3 className="mb-2">Select a model preset</h3>
                <GridDiv>
                  {modelInfo?.packages.map((pkg, idx) => {
                    return (
                      <ModelCard
                        key={idx}
                        disabled={
                          disableModelCards() &&
                          enablecardsForApikey() &&
                          enablecardsForCredentials()
                        }
                        title={pkg.title}
                        description={pkg.description}
                        tags={pkg.tags}
                        refUrl={pkg.refUrl}
                        icon={pkg.icon || modelInfo.icon}
                        dimensions={pkg.dimensions}
                        onClick={(e, dimensionChoices) => {
                          if (
                            disableModelCards() &&
                            enablecardsForApikey() &&
                            enablecardsForCredentials()
                          )
                            return;
                          let formParams: any = {};
                          for (const d of modelInfo.collectInputFor || []) {
                            const val = formMethods.watch(d.key);
                            if (val === "" || val === undefined || val === null) {
                              continue;
                            }
                            formParams = updatedObj(formParams, {
                              [d.key]: d.inputType === "text" ? val : parseFloat(val),
                            });
                          }

                          const model = {
                            ...pkg.params,
                            ...modelInfo.params,
                            ..._.merge(
                              {},
                              ...(pkg.dimensions?.map((dimension, i) => {
                                if (!dimensionChoices?.[i]) return {};
                                return {
                                  ...dimension.options[dimensionChoices[i]],
                                };
                              }) || []),
                            ),
                            ...formParams,
                            provider: modelInfo.provider,
                          };
                          ideMessenger.post("config/addModel", { model });
                          dispatch(
                            setDefaultModel({ title: model.title, force: true }),
                          );
                          navigate("/");
                        }}
                      />
                    );
                  })}
                </GridDiv>
              </>
            )
          )}
        </div>
      </div>
    </FormProvider>
  );
}

export default ConfigureProvider;
