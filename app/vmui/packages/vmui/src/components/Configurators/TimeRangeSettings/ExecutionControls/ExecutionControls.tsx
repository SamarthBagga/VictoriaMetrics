import { FC } from "preact/compat";
import { useTimeDispatch } from "../../../../state/time/TimeStateContext";
import { getAppModeEnable } from "../../../../utils/app-mode";
import Button from "../../../Main/Button/Button";
import { ArrowDownIcon, RefreshIcon, RestartIcon } from "../../../Main/Icons";
import "./style.scss";
import classNames from "classnames";
import Tooltip from "../../../Main/Tooltip/Tooltip";
import useDeviceDetect from "../../../../hooks/useDeviceDetect";
import AutoRefreshControl from "../AutoRefreshControl/AutoRefreshControl";

interface ExecutionControlsProps {
  tooltip: string;
  useAutorefresh?: boolean;
  closeModal: () => void;
}

export const ExecutionControls: FC<ExecutionControlsProps> = ({ tooltip, useAutorefresh, closeModal }) => {
  const { isMobile } = useDeviceDetect();
  const dispatch = useTimeDispatch();
  const appModeEnable = getAppModeEnable();

  const handleUpdate = () => {
    dispatch({ type: "RUN_QUERY" });
    if (!useAutorefresh && isMobile) {
      closeModal();
    }
  };

  return (
    <div className="vm-execution-controls">
      <div
        className={classNames({
          "vm-execution-controls-buttons": true,
          "vm-execution-controls-buttons_mobile": isMobile,
          "vm-header-button": !appModeEnable,
          "vm-autorefresh": useAutorefresh,
        })}
      >
        {useAutorefresh ? (
          <AutoRefreshControl
            anchorClassName="vm-execution-controls-buttons__auto-refresh"
            onRefresh={handleUpdate}
          >
            {({ open, selectedDelay, toggle }) => isMobile ? (
              <div
                className="vm-mobile-option"
                onClick={toggle}
              >
                <span className="vm-mobile-option__icon"><RestartIcon/></span>
                <div className="vm-mobile-option-text">
                  <span className="vm-mobile-option-text__label">Auto-refresh</span>
                  <span className="vm-mobile-option-text__value">{selectedDelay}</span>
                </div>
                <span className="vm-mobile-option__arrow"><ArrowDownIcon/></span>
              </div>
            ) : (
              <>
                <Tooltip title={tooltip}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpdate}
                    startIcon={<RefreshIcon/>}
                    ariaLabel={tooltip}
                  />
                </Tooltip>
                <Tooltip title="Auto-refresh control">
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    endIcon={(
                      <div
                        className={classNames({
                          "vm-auto-refresh-control__arrow": true,
                          "vm-auto-refresh-control__arrow_open": open,
                        })}
                      >
                        <ArrowDownIcon/>
                      </div>
                    )}
                    onClick={toggle}
                    ariaLabel={`Auto-refresh control, current interval: ${selectedDelay}`}
                  >
                    {selectedDelay}
                  </Button>
                </Tooltip>
              </>
            )}
          </AutoRefreshControl>
        ) : isMobile ? (
          <div
            className="vm-mobile-option"
            onClick={handleUpdate}
          >
            <span className="vm-mobile-option__icon"><RestartIcon/></span>
            <div className="vm-mobile-option-text">
              <span className="vm-mobile-option-text__label">Refresh</span>
            </div>
          </div>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            startIcon={<RefreshIcon/>}
            ariaLabel={tooltip}
          />
        )}
      </div>
    </div>
  );
};
