// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import Svg, { Path, SvgProps } from 'react-native-svg';

// eslint-disable-next-line import/prefer-default-export
export const SendIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M3.5 22h17M5 3.5l14 14M5 13.77V3.5h10.27"
      stroke="#fff"
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ReceivedIcon = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="m5.5 17.5 14-14M5.5 7.23V17.5h10.27M4 22h17"
      stroke="#fff"
      strokeWidth={1.5}
      strokeMiterlimit={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RightIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={25}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M12 2.5c-5.51 0-10 4.49-10 10s4.49 10 10 10 10-4.49 10-10-4.49-10-10-10Zm2.79 10.53-3.53 3.53c-.15.15-.34.22-.53.22s-.38-.07-.53-.22a.754.754 0 0 1 0-1.06l3-3-3-3a.754.754 0 0 1 0-1.06c.29-.29.77-.29 1.06 0l3.53 3.53c.3.29.3.77 0 1.06Z"
      fill="#757575"
    />
  </Svg>
);

export const WalletActiveIcon = (props: SvgProps) => (
  <Svg
    width={29}
    height={28}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M17.825 4.608v4.434h-1.75V4.608c0-.315-.28-.466-.466-.466a.468.468 0 0 0-.175.035L6.182 7.665a1.567 1.567 0 0 0-1.015 1.482v.781a4.358 4.358 0 0 0-1.75 3.5V9.147c0-1.389.852-2.625 2.147-3.115l9.263-3.5c.257-.094.525-.14.782-.14 1.166 0 2.216.945 2.216 2.216ZM25.584 16.917v1.166a.583.583 0 0 1-.572.584h-1.704c-.618 0-1.178-.455-1.224-1.062-.035-.362.105-.7.338-.933a1.11 1.11 0 0 1 .816-.339H25a.585.585 0 0 1 .584.584Z"
      fill="#024868"
    />
    <Path
      d="M23.227 15.108h1.19a1.17 1.17 0 0 0 1.167-1.166v-.514a4.397 4.397 0 0 0-4.387-4.386H7.804c-.992 0-1.902.326-2.637.886a4.358 4.358 0 0 0-1.75 3.5v7.852a4.397 4.397 0 0 0 4.387 4.387h13.393a4.397 4.397 0 0 0 4.387-4.387v-.222a1.17 1.17 0 0 0-1.167-1.166h-1.015c-1.12 0-2.193-.689-2.485-1.774a2.33 2.33 0 0 1 .63-2.31 2.325 2.325 0 0 1 1.68-.7Zm-6.393-.233H8.667A.881.881 0 0 1 7.792 14c0-.478.397-.875.875-.875h8.167c.478 0 .875.397.875.875a.881.881 0 0 1-.875.875Z"
      fill="#024868"
    />
  </Svg>
);

export const WalletIcon = (props: SvgProps) => (
  <Svg
    width={25}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M18.54 13.55c-.42.41-.66 1-.6 1.63.09 1.08 1.08 1.87 2.16 1.87H22v1.19c0 2.07-1.69 3.76-3.76 3.76H6.76C4.69 22 3 20.31 3 18.24v-6.73c0-2.07 1.69-3.76 3.76-3.76h11.48c2.07 0 3.76 1.69 3.76 3.76v1.44h-2.02c-.56 0-1.07.22-1.44.6Z"
      stroke="#757575"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 12.41V7.84c0-1.19.73-2.25 1.84-2.67l7.94-3a1.9 1.9 0 0 1 2.57 1.78v3.8M23.059 13.97v2.06c0 .55-.44 1-1 1.02h-1.96c-1.08 0-2.07-.79-2.16-1.87-.06-.63.18-1.22.6-1.63.37-.38.88-.6 1.44-.6h2.08c.56.02 1 .47 1 1.02ZM7.5 12h7"
      stroke="#757575"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon = (props: SvgProps) => (
  <Svg
    width={29}
    height={28}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M26.167 8.458h-7a.881.881 0 0 1-.875-.875c0-.478.397-.875.875-.875h7c.478 0 .875.397.875.875a.881.881 0 0 1-.875.875ZM7.5 8.458H2.833a.881.881 0 0 1-.875-.875c0-.478.397-.875.875-.875H7.5c.478 0 .875.397.875.875a.881.881 0 0 1-.875.875Z"
      fill={props.color ? props.color : "#757575"}
    />
    <Path
      d="M12.166 12.542a4.97 4.97 0 0 1-4.958-4.959 4.97 4.97 0 0 1 4.958-4.958 4.97 4.97 0 0 1 4.959 4.958 4.97 4.97 0 0 1-4.959 4.959Zm0-8.167a3.207 3.207 0 0 0-3.208 3.208 3.207 3.207 0 0 0 3.208 3.209 3.207 3.207 0 0 0 3.209-3.209 3.207 3.207 0 0 0-3.209-3.208ZM26.167 21.292H21.5a.881.881 0 0 1-.875-.875c0-.479.397-.875.875-.875h4.667c.478 0 .875.396.875.875a.881.881 0 0 1-.875.875ZM9.833 21.292h-7a.881.881 0 0 1-.875-.875c0-.479.397-.875.875-.875h7c.478 0 .875.396.875.875a.881.881 0 0 1-.875.875Z"
      fill={props.color ? props.color : "#757575"}
    />
    <Path
      d="M16.833 25.375a4.97 4.97 0 0 1-4.958-4.958 4.97 4.97 0 0 1 4.958-4.959 4.97 4.97 0 0 1 4.959 4.959 4.97 4.97 0 0 1-4.959 4.958Zm0-8.167a3.207 3.207 0 0 0-3.208 3.209 3.207 3.207 0 0 0 3.208 3.208 3.207 3.207 0 0 0 3.209-3.208 3.207 3.207 0 0 0-3.209-3.209Z"
      fill={props.color ? props.color : "#757575"}
    />
  </Svg>
);

export const ScanIcon = (props: SvgProps) => (
  <Svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M2 9V6.5C2 4.01 4.01 2 6.5 2H9M15 2h2.5C19.99 2 22 4.01 22 6.5V9M22 16v1.5c0 2.49-2.01 4.5-4.5 4.5H16M9 22H6.5C4.01 22 2 19.99 2 17.5V15M10.5 7v2c0 1-.5 1.5-1.5 1.5H7c-1 0-1.5-.5-1.5-1.5V7C5.5 6 6 5.5 7 5.5h2c1 0 1.5.5 1.5 1.5ZM18.5 7v2c0 1-.5 1.5-1.5 1.5h-2c-1 0-1.5-.5-1.5-1.5V7c0-1 .5-1.5 1.5-1.5h2c1 0 1.5.5 1.5 1.5ZM10.5 15v2c0 1-.5 1.5-1.5 1.5H7c-1 0-1.5-.5-1.5-1.5v-2c0-1 .5-1.5 1.5-1.5h2c1 0 1.5.5 1.5 1.5ZM18.5 15v2c0 1-.5 1.5-1.5 1.5h-2c-1 0-1.5-.5-1.5-1.5v-2c0-1 .5-1.5 1.5-1.5h2c1 0 1.5.5 1.5 1.5Z"
      stroke="#fff"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
