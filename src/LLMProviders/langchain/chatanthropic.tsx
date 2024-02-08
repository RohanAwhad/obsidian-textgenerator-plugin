import LangchainBase from "./base";

import type { AnthropicInput } from "langchain/chat_models/anthropic";
import React, { useEffect, useState } from "react";
import LLMProviderInterface, { LLMConfig } from "../interface";
import SettingItem from "#/ui/settings/components/item";
import Dropdown from "#/ui/settings/components/dropdown";
import useGlobal from "#/ui/context/global";
import { IconExternalLink, IconReload } from "@tabler/icons-react";
import { request } from "obsidian";
import clsx from "clsx";
import { BaseLanguageModelParams } from "langchain/dist/base_language";
import Input from "#/ui/settings/components/input";
import debug from "debug";

const logger = debug("textgenerator:llmProvider:chatanthropic");

export default class LangchainChatAnthropicProvider
  extends LangchainBase
  implements LLMProviderInterface {
  static provider = "Langchain";
  static id = "Chat Anthropic (Langchain)" as const;
  static slug = "anthropic" as const;
  static displayName: string = "Chat Anthropic";

  provider = LangchainChatAnthropicProvider.provider;
  id = LangchainChatAnthropicProvider.id;
  originalId = LangchainChatAnthropicProvider.id;

  getConfig(
    options: LLMConfig
  ): Partial<AnthropicInput & BaseLanguageModelParams> {
    return this.cleanConfig({
      anthropicApiKey: options.api_key,
      anthropicApiUrl: options.otherOptions?.anthropicApiUrl,
      stopSequences: options.stop,

      // ------------Necessary stuff--------------
      modelKwargs: options.modelKwargs,
      modelName: options.model,
      maxTokens: options.max_tokens,
      temperature: options.temperature,
      frequencyPenalty: +options.frequency_penalty || 0,
      presencePenalty: +options.presence_penalty || 0,
      n: options.n,
      stop: options.stop,
      streaming: options.stream,
      maxRetries: 3,
    });
  }

  async load() {
    const { ChatAnthropic } = await import("langchain/chat_models/anthropic");
    this.llmClass = ChatAnthropic;
  }

  //   getLLM(options: LLMConfig) {
  //     return new ChatAnthropic({
  //       ...this.getConfig(options),
  //     });
  //   }

  RenderSettings(props: Parameters<LLMProviderInterface["RenderSettings"]>[0]) {
    const global = useGlobal();

    const id = props.self.id;

    const config = (global.plugin.settings.LLMProviderOptions[id] ??= {
      model: "claude-2"
    });

    return (
      <>
        <SettingItem
          name="Anthropic api key"
          register={props.register}
          sectionId={props.sectionId}
        >
          <Input
            type="password"
            value={config.api_key || ""}
            setValue={async (value) => {
              config.api_key = value;
              global.plugin.encryptAllKeys();
              global.triggerReload();
              // TODO: it could use a debounce here
              await global.plugin.saveSettings();
            }}
          />
        </SettingItem>

        <SettingItem
          name="Base Path"
          register={props.register}
          sectionId={props.sectionId}
        >
          <Input
            value={config.anthropicApiUrl}
            placeholder="Enter your API BasePath"
            setValue={async (value) => {
              config.anthropicApiUrl = value;
              global.triggerReload();
              // TODO: it could use a debounce here
              await global.plugin.saveSettings();
            }}
          />
        </SettingItem>
        <SettingItem
          name="model"
          register={props.register}
          sectionId={props.sectionId}
        >
          <Input
            value={config.model}
            placeholder="Enter your Model name"
            setValue={async (value) => {
              config.model = value;
              global.triggerReload();
              // TODO: it could use a debounce here
              await global.plugin.saveSettings();
            }}
          />
        </SettingItem>
        <div className="plug-tg-flex plug-tg-flex-col plug-tg-gap-2">
          <div className="plug-tg-text-lg plug-tg-opacity-70">Useful links</div>
          <a href="https://beta.openai.com/signup/">
            <SettingItem
              name="Create account OpenAI"
              className="plug-tg-text-xs plug-tg-opacity-50 hover:plug-tg-opacity-100"
              register={props.register}
              sectionId={props.sectionId}
            >
              <IconExternalLink />
            </SettingItem>
          </a>
          <a href="https://beta.openai.com/docs/api-reference/introduction">
            <SettingItem
              name="API documentation"
              className="plug-tg-text-xs plug-tg-opacity-50 hover:plug-tg-opacity-100"
              register={props.register}
              sectionId={props.sectionId}
            >
              <IconExternalLink />
            </SettingItem>
          </a>
          <a href="https://beta.openai.com/docs/models/overview">
            <SettingItem
              name="more information"
              className="plug-tg-text-xs plug-tg-opacity-50 hover:plug-tg-opacity-100"
              register={props.register}
              sectionId={props.sectionId}
            >
              <IconExternalLink />
            </SettingItem>
          </a>
        </div>
      </>
    );
  }
}