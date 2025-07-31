// Description: Main container for the coding playground and problem description.
// =================================================================================
import Split from "react-split";
import ProblemDescription from "./ProblemDescription/ProblemDescription";
import Playground from "./Playground/Playground";
import Confetti from "react-confetti";
import { Problem as WorkspaceProblem } from "@/utils/types/problem";
import { useState as useWorkspaceState } from "react";
import useWindowSize from "@/hooks/useWindowSize";

const Workspace: React.FC<{ problem: WorkspaceProblem }> = ({ problem }) => {
    const { width, height } = useWindowSize();
    const [success, setSuccess] = useWorkspaceState(false);
	const [solved, setSolved] = useWorkspaceState(false);
    return (
        <Split className='split' minSize={0}>
			<ProblemDescription problem={problem} _solved={solved} />
			<div className='bg-dark-fill-2'>
				<Playground problem={problem} setSuccess={setSuccess} setSolved={setSolved} />
				{success && <Confetti gravity={0.3} tweenDuration={4000} width={width - 1} height={height - 1} />}
			</div>
		</Split>
    )
}
export default Workspace;