import React from "react";
import "./App.css";
import WhitePageContainer from "./components/WhitePageContainer";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "ethers";
import styled from "styled-components";

const Section = styled.div`
  margin-bottom: 20px;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Select = styled.select`
  margin-right: 10px;
`;

const Input = styled.input`
  margin-right: 10px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  resize: vertical;
`;

const Button = styled.button`
  margin-right: 10px;
  background-color: #007bff;
  border: none;
  border-radius: 4px;
  color: #fff;
  padding: 8px 12px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

interface Value {
  type: string;
  name: string;
  value: any;
  checked?: boolean;
}

type EncodedValue = [string, string, string, string];
type ValueWithSalt = Value & { salt: string };

function encodeValues(inValues: ValueWithSalt[]): EncodedValue[] {
  return inValues.map((v) => [
    v.type,
    v.name,
    ethers.utils.defaultAbiCoder.encode([v.type], [v.value]),
    v.salt,
  ]);
}

function decodeValues(inValues: EncodedValue[]): ValueWithSalt[] {
  return inValues.map((v) => ({
    type: v[0],
    name: v[1],
    value: ethers.utils.defaultAbiCoder.decode([v[0]], v[2])[0],
    salt: v[3],
  }));
}

function App() {
  const [values, setValues] = React.useState<Value[]>([
    { type: "string", name: "", value: "" },
  ]);

  const [proofToVerify, setProofToVerify] = React.useState<string>("");
  const [verifyMerkleRoot, setVerifyMerkleRoot] = React.useState<string>("");
  const [data, setData] = React.useState<{
    root: string;
    values: ValueWithSalt[];
  } | null>(null);
  const [outputProof, setOutputProof] = React.useState<string>("");
  const [cleanData, setCleanData] = React.useState<string>("");

  return (
    <>
      <WhitePageContainer>
        <h3>Creator</h3>

        <div>
          <Section>
            {values.map((value, index) => {
              return (
                <InputGroup key={index}>
                  <Select
                    value={value.type}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[index].type = e.target.value;
                      setValues(newValues);
                    }}
                  >
                    <option value="string">string</option>
                    <option value="uint8">uint8</option>
                    <option value="uint32">uint32</option>
                    <option value="uint64">uint64</option>
                    <option value="uint256">uint256</option>
                    <option value="address">address</option>
                    <option value="bytes32">bytes32</option>
                    <option value="bytes">bytes</option>
                  </Select>

                  <Input
                    type="text"
                    placeholder="name"
                    value={value.name}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[index].name = e.target.value;
                      setValues(newValues);
                    }}
                  />
                  <Input
                    type="text"
                    placeholder="value"
                    value={value.value}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[index].value = e.target.value;
                      setValues(newValues);
                    }}
                  />
                  <Input
                    type="checkbox"
                    checked={value.checked}
                    onChange={(e) => {
                      const newValues = [...values];
                      newValues[index].checked = e.target.checked;
                      setValues(newValues);
                    }}
                  />
                </InputGroup>
              );
            })}
          </Section>

          <Section>
            <Button
              onClick={() => {
                const newValues = [...values];
                newValues.push({ type: "string", name: "", value: "" });
                setValues(newValues);
              }}
            >
              Add
            </Button>
          </Section>

          <Section>
            <Button
              onClick={() => {
                const valuesWithSalt: ValueWithSalt[] = values.map((v) => ({
                  ...v,
                  salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                }));

                const encodedValues = encodeValues(valuesWithSalt);

                const tree = StandardMerkleTree.of(encodedValues, [
                  "string",
                  "string",
                  "bytes",
                  "bytes32",
                ]);

                setData({ root: tree.root, values: valuesWithSalt });
              }}
            >
              Encode
            </Button>
          </Section>

          <Section>
            <Button
              onClick={() => {
                const data = JSON.parse(prompt("Paste data") || "");

                setData(data);
                setValues(data.values);
              }}
            >
              Import
            </Button>
          </Section>

          <Section>
            <Button
              onClick={() => {
                if (!data) {
                  return;
                }

                const encodedValues = encodeValues(data.values);

                const tree = StandardMerkleTree.of(encodedValues, [
                  "string",
                  "string",
                  "bytes",
                  "bytes32",
                ]);

                const checkedIndexes: number[] = values.reduce(
                  (acc: number[], v, i) => {
                    if (v.checked) {
                      acc.push(i);
                    }
                    return acc;
                  },
                  []
                );

                setOutputProof(
                  JSON.stringify(tree.getMultiProof(checkedIndexes))
                );
              }}
            >
              Prove
            </Button>
          </Section>
        </div>

        <Section>
          <TextArea value={JSON.stringify(data)} readOnly />
        </Section>

        <Section>
          <TextArea value={outputProof} readOnly />
        </Section>
      </WhitePageContainer>

      <WhitePageContainer>
        <h3>Verifier</h3>

        <Section>
          <input
            type="text"
            placeholder="root"
            value={verifyMerkleRoot}
            onChange={(e) => {
              setVerifyMerkleRoot(e.target.value);
            }}
          />
        </Section>
        <Section>
          <TextArea
            placeholder="proof"
            value={proofToVerify}
            onChange={(e) => {
              setProofToVerify(e.target.value);
            }}
          />
        </Section>
        <Button
          onClick={() => {
            try {
              const proof = JSON.parse(proofToVerify);
              const verified = StandardMerkleTree.verifyMultiProof(
                verifyMerkleRoot,
                ["string", "string", "bytes", "bytes32"],
                proof
              );

              alert(`Verified: ${verified}`);

              if (verified) {
                setCleanData(JSON.stringify(decodeValues(proof.leaves)));
              }
            } catch (e) {
              alert("Fail!");
              console.error(e);
            }
          }}
        >
          Verify
        </Button>

        <Section>
          <TextArea value={cleanData} />
        </Section>
      </WhitePageContainer>
    </>
  );
}

export default App;
