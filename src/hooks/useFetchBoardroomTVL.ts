import {useEffect, useState} from 'react';
import useBombFinance from './useBombFinance';
import useRefresh from './useRefresh';

const useFetchBoardroomTVL = () => {
  const [tvl, setTvl] = useState<number>(0);
  const bombFinance = useBombFinance();
  const {slowRefresh} = useRefresh();

  useEffect(() => {
    async function fetchBoardroomTVL() {
      try {
        setTvl(await bombFinance.getBoardroomTVL());
      } catch (err) {
        console.error(err);
      }
    }
    fetchBoardroomTVL();
  }, [setTvl, bombFinance, slowRefresh]);

  return tvl;
};

export default useFetchBoardroomTVL;
