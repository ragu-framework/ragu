import {RaguServerConfig} from "./config";
import {Request} from "express";


interface ClientSideOnlyProps {
  isServer: false,
  element: HTMLElement
}

interface ServerSideOnlyProps {
  isServer: true,
  config: RaguServerConfig,
  request: Request
}


export type ComponentProps<Props, State> = {
  params: Props,
  state: State,
} & (ClientSideOnlyProps | ServerSideOnlyProps)


export type ClientSideProps<Props, State> = ComponentProps<Props, State> & ClientSideOnlyProps;
export type ServerSideProps<Props, State> = ComponentProps<Props, State> & ServerSideOnlyProps;
