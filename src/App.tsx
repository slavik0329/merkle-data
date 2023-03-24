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
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Input = styled.input`
  margin-right: 10px;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  resize: vertical;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
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

const ButtonBlock = styled.div`
  display: flex;
  margin-bottom: 18px;
`;

interface MerkleValue {
  type: string;
  name: string;
  value: any;
}

const merkleValueAbiEncoding = ["string", "string", "bytes", "bytes32"];

type EncodedMerkleValue = [string, string, string, string];
type MerkleValueWithCheck = MerkleValue & { checked: boolean };
type MerkleValueWithSalt = MerkleValue & { salt: string };

function encodeMerkleValues(
  inValues: MerkleValueWithSalt[]
): EncodedMerkleValue[] {
  return inValues.map((v) => [
    v.type,
    v.name,
    ethers.utils.defaultAbiCoder.encode([v.type], [v.value]),
    v.salt,
  ]);
}

function decodeMerkleValues(
  inValues: EncodedMerkleValue[]
): MerkleValueWithSalt[] {
  return inValues.map((v) => ({
    type: v[0],
    name: v[1],
    value: ethers.utils.defaultAbiCoder.decode([v[0]], v[2])[0],
    salt: v[3],
  }));
}

function encodeValuesToMerkleTree(valuesWithSalt: MerkleValueWithSalt[]) {
  const encodedValues = encodeMerkleValues(valuesWithSalt);

  const tree = StandardMerkleTree.of(encodedValues, merkleValueAbiEncoding);
  return tree;
}

function App() {
  const [values, setValues] = React.useState<MerkleValueWithCheck[]>([
    { type: "string", name: "", value: "", checked: false },
  ]);

  const [proofToVerify, setProofToVerify] = React.useState<string>("");
  const [verifyMerkleRoot, setVerifyMerkleRoot] = React.useState<string>("");
  const [data, setData] = React.useState<{
    root: string;
    values: MerkleValueWithSalt[];
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
                    <option value="bool">bool</option>
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
                      if (value.type.includes("uint")) {
                        newValues[index].value = parseInt(e.target.value);
                      } else {
                        newValues[index].value = e.target.value;
                      }
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

          <ButtonBlock>
            <Button
              onClick={() => {
                const newValues = [...values];
                newValues.push({
                  type: "string",
                  name: "",
                  value: "",
                  checked: false,
                });
                setValues(newValues);
              }}
            >
              Add
            </Button>

            <Button
              onClick={() => {
                const valuesWithSalt: MerkleValueWithSalt[] = values.map(
                  (v) => ({
                    ...v,
                    salt: ethers.utils.hexlify(ethers.utils.randomBytes(32)),
                  })
                );

                const tree = encodeValuesToMerkleTree(valuesWithSalt);

                setData({ root: tree.root, values: valuesWithSalt });
              }}
            >
              Encode
            </Button>

            <Button
              onClick={() => {
                const data = JSON.parse(prompt("Paste data") || "");

                setData(data);
                setValues(data.values);
              }}
            >
              Import
            </Button>

            <Button
              onClick={() => {
                if (!data) {
                  return;
                }

                const encodedValues = encodeMerkleValues(data.values);

                const tree = StandardMerkleTree.of(
                  encodedValues,
                  merkleValueAbiEncoding
                );

                const checkedIndexes: number[] = values.reduce(
                  (acc: number[], v, i) => {
                    if (v.checked) {
                      acc.push(i);
                    }
                    return acc;
                  },
                  []
                );

                const multiProof = tree.getMultiProof(checkedIndexes);

                setOutputProof(
                  JSON.stringify({
                    ...multiProof,
                    leaves: decodeMerkleValues(multiProof.leaves),
                  })
                );
              }}
            >
              Prove
            </Button>
          </ButtonBlock>
        </div>

        <Section>
          <TextArea
            value={data ? JSON.stringify(data) : ""}
            readOnly
            placeholder={"Encoded tree"}
          />
        </Section>

        <Section>
          <TextArea value={outputProof} readOnly placeholder={"Proof"} />
        </Section>
      </WhitePageContainer>

      <WhitePageContainer>
        <h3>Verifier</h3>

        <Section>
          <Input
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
        <Section>
          <Button
            onClick={() => {
              try {
                const proof = JSON.parse(proofToVerify);
                const verified = StandardMerkleTree.verifyMultiProof(
                  verifyMerkleRoot,
                  merkleValueAbiEncoding,
                  {
                    ...proof,
                    leaves: encodeMerkleValues(proof.leaves),
                  }
                );

                alert(`Verified: ${verified}`);

                if (verified) {
                  setCleanData(JSON.stringify(proof.leaves));
                }
              } catch (e) {
                alert("Fail!");
                console.error(e);
              }
            }}
          >
            Verify
          </Button>
        </Section>

        <Section>
          <TextArea value={cleanData} placeholder={"decoded proof"} readOnly />
        </Section>
      </WhitePageContainer>
    </>
  );
}

export default App;
