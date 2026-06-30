import {
  useEffect,
  useState,
} from "react";

import {
  closingService,
} from "../services/closingService";
import type {
  ClosingMonthStatus,
} from "../types/closings";


export function useClosingMonthStatus(
  referenceDate:
    string | null | undefined,
) {
  const [status, setStatus] =
    useState<
      ClosingMonthStatus | null
    >(null);

  const [isLoading, setIsLoading] =
    useState(false);


  useEffect(() => {
    if (!referenceDate) {
      setStatus(null);
      return;
    }

    let isMounted = true;

    setIsLoading(true);

    closingService
      .getMonthStatus(
        referenceDate,
      )
      .then((result) => {
        if (isMounted) {
          setStatus(result);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStatus(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [referenceDate]);


  return {
    status,
    isLoading,
  };
}
