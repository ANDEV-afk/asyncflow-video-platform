import { Button } from "@/components/ui/button";

type StartRecordingButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  isRecording?: boolean;
  label?: string;
};

export default function StartRecordingButton({
  onClick,
  disabled = false,
  isRecording = false,
  label,
}: StartRecordingButtonProps) {
  return (
    <Button
      type="button"
      size="lg"
      onClick={onClick}
      disabled={disabled}
      variant={isRecording ? "destructive" : "default"}
      className="w-full sm:w-auto"
    >
      {label ?? (isRecording ? "Stop Recording" : "Start Recording")}
    </Button>
  );
}
