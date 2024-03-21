import { initResetFun } from '@/utils/storeTools';
import { useCounterStore } from './counter';

export interface IAppStore {
	useCounter: ReturnType<typeof useCounterStore>;
	//其他store
}

const appStore: IAppStore = {} as IAppStore;

// 注册app状态库

export const registerStore = () => {
	appStore.useCounter = useCounterStore();
	//其他store

	//重写reset方法
	initResetFun(appStore);
};

export default appStore;
