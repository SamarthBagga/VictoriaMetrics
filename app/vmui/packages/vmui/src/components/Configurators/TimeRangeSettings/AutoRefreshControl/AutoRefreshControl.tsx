import { FC, useEffect, useRef } from "preact/compat";
import { ReactNode } from "react";
import { useSearchParams } from "react-router";
import classNames from "classnames";
import useBoolean from "../../../../hooks/useBoolean";
import useDeviceDetect from "../../../../hooks/useDeviceDetect";
import Popper from "../../../Main/Popper/Popper";
import { getMillisecondsFromDuration } from "../../../../utils/time";
import "./style.scss";

const delayOptions = [
  "Off",
  "1s",
  "2s",
  "5s",
  "10s",
  "30s",
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h"
];

const DEFAULT_OPTION = delayOptions[0];
const MIN_REFRESH_MS = getMillisecondsFromDuration(delayOptions[1]);
const MAX_REFRESH_MS = getMillisecondsFromDuration(delayOptions[delayOptions.length - 1]);
const REFRESH_URL_PARAM = "refresh";

const durationToMs = (duration: string | null) => {
  return duration ? getMillisecondsFromDuration(duration) : 0;
};

const isValidDelay = (delay: number) => {
  return delay >= MIN_REFRESH_MS && delay <= MAX_REFRESH_MS;
};

interface AutoRefreshRenderProps {
  open: boolean;
  selectedDelay: string;
  toggle: () => void;
}

interface AutoRefreshControlProps {
  children: (props: AutoRefreshRenderProps) => ReactNode;
  onRefresh: () => void;
  anchorClassName?: string;
}

const AutoRefreshControl: FC<AutoRefreshControlProps> = ({ children, onRefresh, anchorClassName }) => {
  const { isMobile } = useDeviceDetect();
  const [searchParams, setSearchParams] = useSearchParams();
  const optionsButtonRef = useRef<HTMLDivElement>(null);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const rawDelay = searchParams.get(REFRESH_URL_PARAM);
  const selectedDelay = rawDelay && isValidDelay(durationToMs(rawDelay)) ? rawDelay : DEFAULT_OPTION;

  const {
    value: openOptions,
    toggle: toggleOpenOptions,
    setFalse: handleCloseOptions,
  } = useBoolean(false);

  const handleChange = (duration: string) => () => {
    setSearchParams(prev => {
      const nextParams = new URLSearchParams(prev);

      if (durationToMs(duration)) {
        nextParams.set(REFRESH_URL_PARAM, duration);
      } else {
        nextParams.delete(REFRESH_URL_PARAM);
      }

      return nextParams;
    });
    handleCloseOptions();
  };

  useEffect(() => {
    const delay = durationToMs(selectedDelay);
    if (!isValidDelay(delay)) return;

    const timer = window.setInterval(() => onRefreshRef.current(), delay);
    return () => window.clearInterval(timer);
  }, [selectedDelay]);

  return (
    <>
      <div
        ref={optionsButtonRef}
        className={anchorClassName}
      >
        {children({
          open: openOptions,
          selectedDelay,
          toggle: toggleOpenOptions,
        })}
      </div>
      <Popper
        open={openOptions}
        placement="bottom-right"
        onClose={handleCloseOptions}
        buttonRef={optionsButtonRef}
        title={isMobile ? "Auto-refresh duration" : undefined}
      >
        <div
          className={classNames({
            "vm-auto-refresh-control-list": true,
            "vm-auto-refresh-control-list_mobile": isMobile,
          })}
          role="menu"
        >
          {delayOptions.map(duration => (
            <button
              type="button"
              className={classNames({
                "vm-list-item": true,
                "vm-list-item_mobile": isMobile,
                "vm-list-item_active": duration === selectedDelay,
              })}
              role="menuitemradio"
              aria-checked={duration === selectedDelay}
              key={duration}
              onClick={handleChange(duration)}
            >
              {duration}
            </button>
          ))}
        </div>
      </Popper>
    </>
  );
};

export default AutoRefreshControl;
