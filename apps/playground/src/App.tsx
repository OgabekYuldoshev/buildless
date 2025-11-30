import { useBuilder } from "@buildless/react";
import { createBuilder } from "@buildless/core";
import { fields } from "./fields";

const builder = createBuilder({ fields });

export default function App() {
	useBuilder(builder);

	return <div className="text-red-500">App</div>;
}
